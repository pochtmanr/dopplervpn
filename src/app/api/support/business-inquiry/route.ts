import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';

// Business inquiries are support_tickets rows with topic 'business', so the
// admin panel, email replies and the n8n Telegram notifier handle them as-is.
// Allowlists and caps mirror the CHECKs in supabase/migrations/006_business_inquiries.sql.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* English labels: they build the subject the admin panel and reply emails show */
const INQUIRY_TYPES = {
  partnership: 'Partnership',
  enterprise: 'Enterprise / Team',
  press: 'Press / Media',
  reseller: 'Reseller / Affiliate',
  other: 'Business inquiry',
} as const;

const INDUSTRIES = [
  'tech_saas',
  'media_press',
  'finance',
  'education',
  'healthcare',
  'travel',
  'retail_ecommerce',
  'government_ngo',
  'telecom_isp',
  'other',
] as const;

const COMPANY_MIN = 2;
const MESSAGE_MIN = 10;
const NAME_MAX = 120;
const WEBSITE_MAX = 255;
const MESSAGE_MAX = 5000;

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Accepts "acme.com" or a full URL; returns a normalised http(s) URL, or undefined if invalid. */
function normaliseWebsite(value: string): string | undefined {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes('.')) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: 'business-inquiry' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const {
      inquiry_type,
      company_name,
      industry,
      contact_name,
      company_website,
      message,
      contact_email,
      fax,
    } = body ?? {};

    // Honeypot: humans never see this field. Answer like a success so bots learn nothing.
    if (typeof fax === 'string' && fax.trim() !== '') {
      return NextResponse.json({ ticket_number: `BIZ-${randomUUID().slice(0, 8).toUpperCase()}` });
    }

    if (typeof inquiry_type !== 'string' || !(inquiry_type in INQUIRY_TYPES)) {
      return NextResponse.json({ error: 'Invalid inquiry type' }, { status: 400 });
    }

    const company = optionalText(company_name);
    if (!company || company.length < COMPANY_MIN || company.length > NAME_MAX) {
      return NextResponse.json(
        { error: `Company name must be ${COMPANY_MIN}–${NAME_MAX} characters` },
        { status: 400 }
      );
    }

    const industryValue = optionalText(industry);
    if (industryValue && !(INDUSTRIES as readonly string[]).includes(industryValue)) {
      return NextResponse.json({ error: 'Invalid industry' }, { status: 400 });
    }

    const name = optionalText(contact_name);
    if (name && name.length > NAME_MAX) {
      return NextResponse.json({ error: `Name must be at most ${NAME_MAX} characters` }, { status: 400 });
    }

    let website: string | null = null;
    const websiteInput = optionalText(company_website);
    if (websiteInput) {
      const normalised = normaliseWebsite(websiteInput);
      if (!normalised || normalised.length > WEBSITE_MAX) {
        return NextResponse.json({ error: 'Invalid website' }, { status: 400 });
      }
      website = normalised;
    }

    const text = optionalText(message);
    if (!text || text.length < MESSAGE_MIN || text.length > MESSAGE_MAX) {
      return NextResponse.json(
        { error: `Message must be ${MESSAGE_MIN}–${MESSAGE_MAX} characters` },
        { status: 400 }
      );
    }

    const email = optionalText(contact_email)?.toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const typeLabel = INQUIRY_TYPES[inquiry_type as keyof typeof INQUIRY_TYPES];
    const ticketNumber = `BIZ-${randomUUID().slice(0, 8).toUpperCase()}`;

    const supabase = createUntypedAdminClient();
    const { error: insertError } = await supabase.from('support_tickets').insert({
      ticket_number: ticketNumber,
      topic: 'business',
      inquiry_type,
      subject: `${typeLabel} — ${company}`,
      description: text,
      contact_email: email,
      company_name: company,
      industry: industryValue,
      contact_name: name,
      company_website: website,
      account_id: null,
      status: 'open',
      priority: 'normal',
    });

    if (insertError) {
      console.error('Insert business inquiry error:', insertError);
      return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
    }

    return NextResponse.json({ ticket_number: ticketNumber });
  } catch (error) {
    console.error('Business inquiry error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
