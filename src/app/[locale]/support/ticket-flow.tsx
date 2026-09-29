"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { ThinkingOrb } from "thinking-orbs";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/facts";
import { CARD_TITLE } from "@/components/ui/card-recipes";
import { PlatformLogo } from "@/components/glyph/platform-icons";
import {
  BACK_PATH,
  CHECK_PATH,
  CLOSE_PATH,
  COPY_PATH,
  DIALOG_PANEL,
  Icon,
  MinHint,
  ROW_DELAYS,
  StepPanel,
  isCoarsePointer,
  useModalDialog,
  useVisualViewportFit,
} from "@/components/ui/modal-parts";
import {
  DESCRIPTION_MIN,
  DEVICE_PLATFORMS,
  PAYMENT_PROVIDERS,
  PUBLIC_ISSUE_CATEGORIES,
  SUBJECT_MIN,
  buildWebTicketBody,
  createRequestTracker,
  detailBlockers,
  guidePathForCategory,
  isBillingCategory,
  isTechnicalCategory,
  replyBlockers,
  replyDestination,
  whatsappChoiceEnabled,
  type DevicePlatform,
  type PaymentProvider,
  type PublicIssueCategory,
  type ReplyChannel,
  type WebTicketDraft,
} from "@/lib/support/web-ticket-draft";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light";
const INPUT =
  "w-full min-h-11 rounded-xl border bg-bg-primary/50 px-4 py-3 text-base text-text-primary " +
  "placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-colors";
const LABEL = "block text-xs font-medium mb-1.5";
const MONO = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

const CATEGORY_ICON: Record<PublicIssueCategory, string> = {
  account:
    "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  payment:
    "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  subscription:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  connection:
    "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  performance: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  app: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  refund: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3",
  privacy:
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  feature_request:
    "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  other:
    "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
};

const GLOBE =
  "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418";
const QUESTION =
  "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z";
const MAIL =
  "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75";
const PHONE =
  "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z";
const PAPER_PLANE =
  "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5";

const STEP_KEYS = ["ticket.stepIssue", "ticket.stepDetails", "ticket.stepReply", "ticket.stepReview"] as const;

export interface TicketAccountPrefill {
  account_id: string;
  contact_method: string | null;
  contact_value: string | null;
}

export interface TicketFormState {
  step: 1 | 2 | 3 | 4;
  direction: "none" | "forward" | "back";
  issueCategory: PublicIssueCategory | null;
  subject: string;
  description: string;
  devicePlatform: DevicePlatform | null;
  osVersion: string;
  appVersion: string;
  paymentProvider: PaymentProvider | null;
  paymentOrderRef: string;
  accountId: string;
  replyChannel: ReplyChannel | null;
  email: string;
  telegramUsername: string;
  whatsapp: string;
}

export interface TicketSession {
  draft: TicketFormState;
  patch: (partial: Partial<TicketFormState>) => void;
  submitting: boolean;
  error: string;
  success: { ticketNumber: string } | null;
  claimRequest: () => { id: string; at: string } | null;
  settle: (error: string) => void;
  succeed: (ticketNumber: string) => void;
  reset: () => void;
}

function emptyForm(account: TicketAccountPrefill | null): TicketFormState {
  return {
    step: 1,
    direction: "none",
    issueCategory: null,
    subject: "",
    description: "",
    devicePlatform: null,
    osVersion: "",
    appVersion: "",
    paymentProvider: null,
    paymentOrderRef: "",
    accountId: account?.account_id ?? "",
    replyChannel: null,
    email: account?.contact_method === "email" ? account.contact_value ?? "" : "",
    telegramUsername: "",
    whatsapp: "",
  };
}

export function useTicketSession(account: TicketAccountPrefill | null): TicketSession {
  const accountRef = useRef(account);
  accountRef.current = account;
  const tracker = useRef(createRequestTracker());
  const [draft, setDraft] = useState<TicketFormState>(() => emptyForm(account));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ ticketNumber: string } | null>(null);

  useEffect(() => {
    if (!account) return;
    setDraft((prev) => ({
      ...prev,
      accountId: prev.accountId || account.account_id || "",
      email:
        prev.email ||
        (account.contact_method === "email" && account.contact_value ? account.contact_value : ""),
    }));
  }, [account]);

  return {
    draft,
    patch: (partial) => setDraft((prev) => ({ ...prev, ...partial })),
    submitting,
    error,
    success,
    claimRequest: () => {
      const request = tracker.current.claim(() => ({
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
      }));
      if (!request) return null;
      setSubmitting(true);
      setError("");
      return request;
    },
    settle: (message) => {
      tracker.current.settle();
      setSubmitting(false);
      setError(message);
    },
    succeed: (ticketNumber) => {
      tracker.current.settle();
      setSubmitting(false);
      setError("");
      setSuccess({ ticketNumber });
    },
    reset: () => {
      tracker.current.reset();
      setSubmitting(false);
      setError("");
      setSuccess(null);
      setDraft(emptyForm(accountRef.current));
    },
  };
}

function contractDraft(form: TicketFormState, request: { id: string; at: string }): WebTicketDraft | null {
  if (!form.issueCategory || !form.replyChannel) return null;
  return {
    issueCategory: form.issueCategory,
    subject: form.subject,
    description: form.description,
    devicePlatform: form.devicePlatform,
    osVersion: form.osVersion,
    appVersion: form.appVersion,
    paymentProvider: form.paymentProvider,
    paymentOrderRef: form.paymentOrderRef,
    accountId: form.accountId,
    replyChannel: form.replyChannel,
    email: form.email,
    telegramUsername: form.telegramUsername,
    whatsapp: form.whatsapp,
    clientRequestId: request.id,
    acknowledgedAt: request.at,
  };
}

function useKeyboardOffset(active: boolean): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const fit = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(covered > 80 ? covered : 0);
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, [active]);
  return active ? offset : 0;
}

interface TicketFlowProps {
  shell: "page" | "dialog";
  session: TicketSession;
  onCancel: () => void;
  onDone: () => void;
  onOpenRemoval: () => void;
}

export function TicketFlow({ shell, session, onCancel, onDone, onOpenRemoval }: TicketFlowProps) {
  const titleId = useId();
  const steps = (
    <FlowSteps
      shell={shell}
      titleId={titleId}
      session={session}
      onCancel={onCancel}
      onDone={onDone}
      onOpenRemoval={onOpenRemoval}
    />
  );
  if (shell === "dialog") {
    return (
      <DialogFrame titleId={titleId} onClose={session.success ? onDone : onCancel}>
        {steps}
      </DialogFrame>
    );
  }
  return <PageFrame>{steps}</PageFrame>;
}

function PageFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.getElementById("ticket-request")?.scrollIntoView({ block: "start" });
  }, []);
  return (
    <section id="ticket-request" className="scroll-mt-28 w-full">
      <div className="relative w-full rounded-2xl border border-overlay/10 bg-bg-secondary">{children}</div>
    </section>
  );
}

function DialogFrame({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useModalDialog(panelRef, onClose);
  useVisualViewportFit(overlayRef);
  return (
    <div
      ref={overlayRef}
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
      className="overlay-dim fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-bg-primary/70 p-4 animate-[fadeIn_200ms_ease-out] sm:items-center"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col animate-[slideUp_200ms_ease-out]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`${DIALOG_PANEL} max-h-[90vh] min-h-0 outline-none`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function FlowSteps({
  shell,
  titleId,
  session,
  onCancel,
  onDone,
  onOpenRemoval,
}: TicketFlowProps & { titleId: string }) {
  const t = useTranslations("support");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [showIssues, setShowIssues] = useState(false);
  const keyboardOffset = useKeyboardOffset(shell === "page");
  const { draft } = session;
  const category = draft.issueCategory;
  const technical = category ? isTechnicalCategory(category) : false;
  const billing = category ? isBillingCategory(category) : false;
  const whatsappEnabled = whatsappChoiceEnabled();
  const channels: ReplyChannel[] = whatsappEnabled
    ? ["telegram", "email", "whatsapp"]
    : ["telegram", "email"];

  useEffect(() => {
    if (shell !== "page") return;
    document.getElementById("ticket-request")?.scrollIntoView({ block: "start" });
  }, [draft.step, shell, session.success]);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    if (session.success || shell === "page" || isCoarsePointer() || draft.step === 1 || draft.step === 4) {
      heading.focus({ preventScroll: true });
      return;
    }
    if (draft.step === 2) subjectRef.current?.focus();
  }, [draft.step, session.success, shell]);

  const detailIssues =
    category == null
      ? []
      : detailBlockers({
          issueCategory: category,
          subject: draft.subject,
          description: draft.description,
          devicePlatform: draft.devicePlatform,
          paymentProvider: draft.paymentProvider,
        });
  const replyIssues = replyBlockers({
    replyChannel: draft.replyChannel,
    email: draft.email,
    telegramUsername: draft.telegramUsername,
    whatsapp: draft.whatsapp,
  });

  const ready =
    draft.step === 1
      ? category != null
      : draft.step === 2
        ? detailIssues.length === 0
        : draft.step === 3
          ? replyIssues.length === 0
          : category != null && detailIssues.length === 0 && replyIssues.length === 0;

  const go = (step: TicketFormState["step"]) => {
    setShowIssues(false);
    session.patch({
      step,
      direction: step > draft.step ? "forward" : "back",
    });
  };

  const submit = async () => {
    if (!ready || !category) {
      if (detailIssues.length) go(2);
      else if (replyIssues.length) go(3);
      else go(1);
      return;
    }
    const request = session.claimRequest();
    if (!request) return;
    const body = contractDraft(draft, request);
    if (!body) {
      session.settle(t("ticket.errorGeneric"));
      return;
    }
    try {
      const res = await fetch("/api/support/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildWebTicketBody(body)),
      });
      const data = (await res.json().catch(() => null)) as { ticket_number?: string } | null;
      if (!res.ok || !data?.ticket_number) {
        session.settle(t("ticket.errorGeneric"));
        return;
      }
      session.succeed(data.ticket_number);
    } catch {
      session.settle(t("ticket.errorOffline"));
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowIssues(true);
    if (!ready) return;
    if (draft.step < 4) {
      go((draft.step + 1) as TicketFormState["step"]);
      return;
    }
    void submit();
  };

  const guide = guidePathForCategory(category);
  const destination = replyDestination(draft);
  const destinationKey =
    draft.replyChannel === "telegram"
      ? "ticket.destinationTelegram"
      : draft.replyChannel === "whatsapp"
        ? "ticket.destinationWhatsapp"
        : "ticket.destinationEmail";

  return (
    <form onSubmit={onSubmit} noValidate className={shell === "dialog" ? "flex min-h-0 flex-1 flex-col" : ""}>
      <div className="flex items-start gap-4 p-4 pb-3 sm:p-6 sm:pb-4">
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className={`${CARD_TITLE} focus:outline-none`}
          >
            {session.success ? t("ticket.successTitle") : t("ticket.title")}
          </h2>
          {!session.success && <p className="mt-1 text-sm text-text-muted">{t("ticket.subtitle")}</p>}
        </div>
        <button
          type="button"
          onClick={session.success ? onDone : onCancel}
          className={`-me-2 -mt-2 min-h-11 min-w-11 rounded-lg p-2 text-text-muted transition-colors hover:bg-overlay/5 hover:text-text-primary ${FOCUS}`}
          aria-label={t("ticket.close")}
        >
          <Icon d={CLOSE_PATH} strokeWidth={2} />
        </button>
      </div>

      {!session.success && (
        <div className="border-b border-overlay/5 px-4 pb-4 sm:px-6">
          <div className="flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                  n <= draft.step ? "bg-accent-teal" : "bg-overlay/10"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-text-tertiary" aria-live="polite">
            <span>{t("ticket.stepOf", { current: draft.step, total: 4 })}</span>
            <span className="ms-2">{t(STEP_KEYS[draft.step - 1])}</span>
          </p>
        </div>
      )}

      <div
        className={
          shell === "dialog"
            ? "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            : "p-4 sm:p-6"
        }
      >
        {session.success ? (
          <Receipt
            ticketNumber={session.success.ticketNumber}
            destination={destination}
            destinationText={t(destinationKey, { destination })}
            showBot={draft.replyChannel === "telegram"}
          />
        ) : draft.step === 1 ? (
          <StepPanel key="issue" direction={draft.direction}>
            <p id={`${titleId}-issue`} className="mb-3 text-sm font-medium text-text-primary">
              {t("ticket.categoryPrompt")}
            </p>
            <ChoiceGrid label={t("ticket.categoryPrompt")}>
              {PUBLIC_ISSUE_CATEGORIES.map((key) => (
                <ChoiceButton
                  key={key}
                  pressed={category === key}
                  onClick={() => session.patch({ issueCategory: key })}
                  icon={<Icon d={CATEGORY_ICON[key]} />}
                  label={t(`ticket.categories.${key}`)}
                />
              ))}
            </ChoiceGrid>
            {guide && category && (
              <p className="mt-4 text-sm text-text-muted">
                <span className="mb-1 block text-xs text-text-tertiary">{t("ticket.guideOptional")}</span>
                <GuideLink href={guide}>{guideText(category, t)}</GuideLink>
              </p>
            )}
          </StepPanel>
        ) : draft.step === 2 && category ? (
          <StepPanel key="details" direction={draft.direction}>
            <div className="space-y-5">
              {technical && (
                <div>
                  <p id={`${titleId}-platform`} className={`${LABEL} text-text-muted`}>
                    {t("ticket.platformLabel")}
                  </p>
                  <ChoiceGrid label={t("ticket.platformLabel")}>
                    {DEVICE_PLATFORMS.map((key) => (
                      <ChoiceButton
                        key={key}
                        pressed={draft.devicePlatform === key}
                        onClick={() => session.patch({ devicePlatform: key })}
                        icon={<PlatformMark platform={key} />}
                        label={t(`ticket.platforms.${key}`)}
                      />
                    ))}
                  </ChoiceGrid>
                  {showIssues && detailIssues.includes("platform") && (
                    <p className="mt-2 text-xs text-danger">{t("ticket.platformRequired")}</p>
                  )}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field
                      id="ticket-os"
                      label={t("ticket.osLabel")}
                      value={draft.osVersion}
                      placeholder={t("ticket.osPlaceholder")}
                      onChange={(osVersion) => session.patch({ osVersion })}
                    />
                    <Field
                      id="ticket-app"
                      label={t("ticket.appLabel")}
                      value={draft.appVersion}
                      placeholder={t("ticket.appPlaceholder")}
                      onChange={(appVersion) => session.patch({ appVersion })}
                    />
                  </div>
                </div>
              )}
              {billing && (
                <div>
                  <p className={`${LABEL} text-text-muted`}>{t("ticket.providerLabel")}</p>
                  <ChoiceGrid label={t("ticket.providerLabel")}>
                    {PAYMENT_PROVIDERS.map((key) => (
                      <ChoiceButton
                        key={key}
                        pressed={draft.paymentProvider === key}
                        onClick={() => session.patch({ paymentProvider: key })}
                        icon={<ProviderMark provider={key} />}
                        label={t(`ticket.providers.${key}`)}
                      />
                    ))}
                  </ChoiceGrid>
                  {showIssues && detailIssues.includes("provider") && (
                    <p className="mt-2 text-xs text-danger">{t("ticket.providerRequired")}</p>
                  )}
                  <div className="mt-4">
                    <Field
                      id="ticket-order"
                      label={t("ticket.orderLabel")}
                      value={draft.paymentOrderRef}
                      placeholder={t("ticket.orderPlaceholder")}
                      autoComplete="off"
                      onChange={(paymentOrderRef) => session.patch({ paymentOrderRef })}
                    />
                  </div>
                </div>
              )}
              <Field
                id="ticket-subject"
                inputRef={subjectRef}
                label={t("ticket.subjectLabel")}
                value={draft.subject}
                placeholder={t("ticket.subjectPlaceholder")}
                describedBy="ticket-subject-hint"
                onChange={(subject) => session.patch({ subject })}
                hint={
                  <MinHint
                    id="ticket-subject-hint"
                    text={t("ticket.subjectHint", { min: SUBJECT_MIN })}
                    count={draft.subject.trim().length}
                    min={SUBJECT_MIN}
                  />
                }
              />
              <div>
                <label htmlFor="ticket-desc" className={`${LABEL} text-text-muted`}>
                  {t("ticket.descriptionLabel")}
                </label>
                <textarea
                  id="ticket-desc"
                  rows={4}
                  value={draft.description}
                  onChange={(event) => session.patch({ description: event.target.value })}
                  placeholder={t("ticket.descriptionPlaceholder")}
                  aria-describedby="ticket-desc-hint"
                  className={`${INPUT} resize-y`}
                />
                <MinHint
                  id="ticket-desc-hint"
                  text={t("ticket.descriptionHint", { min: DESCRIPTION_MIN })}
                  count={draft.description.trim().length}
                  min={DESCRIPTION_MIN}
                />
              </div>
              <Field
                id="ticket-account"
                label={t("ticket.accountIdLabel")}
                value={draft.accountId}
                placeholder="VPN-XXXX-XXXX-XXXX"
                dir="ltr"
                mono
                autoComplete="off"
                onChange={(accountId) => session.patch({ accountId: accountId.toUpperCase() })}
              />
            </div>
          </StepPanel>
        ) : draft.step === 3 ? (
          <StepPanel key="reply" direction={draft.direction}>
            <p className="mb-3 text-sm font-medium text-text-primary">{t("ticket.replyPrompt")}</p>
            <ChoiceGrid label={t("ticket.replyPrompt")}>
              {channels.map((key) => (
                <ChoiceButton
                  key={key}
                  pressed={draft.replyChannel === key}
                  onClick={() => session.patch({ replyChannel: key })}
                  icon={
                    key === "telegram" ? (
                      <Icon d={PAPER_PLANE} />
                    ) : key === "email" ? (
                      <Icon d={MAIL} />
                    ) : (
                      <Icon d={PHONE} />
                    )
                  }
                  label={t(`ticket.channels.${key}`)}
                  hint={key === "whatsapp" ? t("ticket.whatsappManual") : undefined}
                />
              ))}
            </ChoiceGrid>
            {draft.replyChannel === "email" && (
              <div className="mt-4">
                <Field
                  id="ticket-email"
                  type="email"
                  label={t("ticket.emailLabel")}
                  value={draft.email}
                  placeholder={t("ticket.emailPlaceholder")}
                  autoComplete="email"
                  dir="ltr"
                  invalid={showIssues && replyIssues.includes("email")}
                  describedBy={showIssues && replyIssues.includes("email") ? "ticket-email-hint" : undefined}
                  onChange={(email) => session.patch({ email })}
                />
                {showIssues && replyIssues.includes("email") && (
                  <p id="ticket-email-hint" className="mt-1.5 text-xs text-danger">
                    {t("ticket.emailInvalid")}
                  </p>
                )}
              </div>
            )}
            {draft.replyChannel === "telegram" && (
              <div className="mt-4 space-y-3">
                <Field
                  id="ticket-telegram"
                  label={t("ticket.telegramLabel")}
                  value={draft.telegramUsername}
                  placeholder={t("ticket.telegramPlaceholder")}
                  autoComplete="username"
                  dir="ltr"
                  invalid={showIssues && replyIssues.includes("telegram")}
                  describedBy="ticket-telegram-hint"
                  onChange={(telegramUsername) => session.patch({ telegramUsername })}
                />
                <p id="ticket-telegram-hint" className="text-xs text-text-muted">
                  {showIssues && replyIssues.includes("telegram")
                    ? t("ticket.usernameInvalid")
                    : t("ticket.telegramHint")}
                </p>
                <a
                  href={CONTACT.telegram.supportBot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center text-sm text-accent-teal underline underline-offset-4 ${FOCUS}`}
                >
                  {t("ticket.botCta")}
                </a>
                <p className="text-xs text-text-muted">{t("ticket.botNote")}</p>
              </div>
            )}
            {draft.replyChannel === "whatsapp" && (
              <div className="mt-4">
                <Field
                  id="ticket-whatsapp"
                  type="tel"
                  label={t("ticket.whatsappLabel")}
                  value={draft.whatsapp}
                  placeholder={t("ticket.whatsappPlaceholder")}
                  autoComplete="tel"
                  dir="ltr"
                  invalid={showIssues && replyIssues.includes("whatsapp")}
                  describedBy="ticket-whatsapp-hint"
                  onChange={(whatsapp) => session.patch({ whatsapp })}
                />
                <p id="ticket-whatsapp-hint" className="mt-1.5 text-xs text-text-muted">
                  {showIssues && replyIssues.includes("whatsapp")
                    ? t("ticket.whatsappInvalid")
                    : t("ticket.whatsappHint")}
                </p>
              </div>
            )}
          </StepPanel>
        ) : (
          category && (
            <StepPanel key="review" direction={draft.direction}>
              <h3 className="mb-3 font-display text-base font-semibold text-text-primary">
                {t("ticket.reviewHeading")}
              </h3>
              <dl className="space-y-3 text-sm">
                <ReviewRow label={t("ticket.categoryLabel")} value={t(`ticket.categories.${category}`)} />
                {technical && draft.devicePlatform && (
                  <ReviewRow label={t("ticket.platformLabel")} value={t(`ticket.platforms.${draft.devicePlatform}`)} />
                )}
                {technical && draft.osVersion.trim() && (
                  <ReviewRow label={t("ticket.osLabel")} value={draft.osVersion.trim()} ltr />
                )}
                {technical && draft.appVersion.trim() && (
                  <ReviewRow label={t("ticket.appLabel")} value={draft.appVersion.trim()} ltr />
                )}
                {billing && draft.paymentProvider && (
                  <ReviewRow
                    label={t("ticket.providerLabel")}
                    value={t(`ticket.providers.${draft.paymentProvider}`)}
                  />
                )}
                {billing && draft.paymentOrderRef.trim() && (
                  <ReviewRow label={t("ticket.orderLabel")} value={draft.paymentOrderRef.trim()} ltr />
                )}
                <ReviewRow label={t("ticket.subjectLabel")} value={draft.subject.trim()} />
                <ReviewRow label={t("ticket.descriptionLabel")} value={draft.description.trim()} pre />
                {draft.accountId.trim() && (
                  <ReviewRow label={t("ticket.accountIdLabel")} value={draft.accountId.trim()} ltr />
                )}
                <ReviewRow label={t("ticket.receiptReplyTo")} value={destination} ltr />
              </dl>
              <p className="mt-4 text-sm text-text-muted">{t(destinationKey, { destination })}</p>
              {draft.accountId.trim() && (
                <p className="mt-3 text-sm text-text-muted">{t("ticket.accountClaim")}</p>
              )}
              <div className="mt-4 rounded-xl border border-overlay/10 bg-bg-primary/40 p-4">
                <p className="text-sm text-text-primary">{t("ticket.notice")}</p>
                <a
                  href="#contact-removal"
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenRemoval();
                  }}
                  className={`mt-2 inline-flex min-h-11 items-center text-sm text-accent-teal underline underline-offset-4 ${FOCUS}`}
                >
                  {t("ticket.removalLink")}
                </a>
                <p className="text-xs text-text-muted">{t("ticket.removalSeparate")}</p>
              </div>
            </StepPanel>
          )
        )}
        {session.error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {session.error}
          </p>
        )}
      </div>

      <div
        className={
          shell === "page"
            ? "sticky z-10 border-t border-overlay/5 bg-bg-secondary px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
            : "shrink-0 border-t border-overlay/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
        }
        style={shell === "page" ? { bottom: keyboardOffset } : undefined}
      >
        {session.success ? (
          <button type="button" onClick={onDone} className={`cta-key min-h-11 w-full rounded-xl text-sm font-semibold ${FOCUS}`}>
            {t("ticket.close")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (draft.step === 1 ? onCancel() : go((draft.step - 1) as TicketFormState["step"]))}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-overlay/15 px-3 text-sm text-text-primary ${FOCUS}`}
            >
              {draft.step > 1 && <Icon d={BACK_PATH} className="h-4 w-4 rtl:-scale-x-100" strokeWidth={2} />}
              {draft.step === 1 ? t("ticket.cancel") : t("ticket.back")}
            </button>
            <button
              type="submit"
              aria-disabled={!ready || session.submitting}
              className={`cta-key inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${FOCUS}`}
            >
              {session.submitting ? (
                <>
                  <span className="loader-in inline-flex h-7 w-7 items-center justify-center">
                    <ThinkingOrb state="solving" size={20} aria-hidden="true" />
                  </span>
                  {t("ticket.submitting")}
                </>
              ) : draft.step === 4 ? (
                t("ticket.submit")
              ) : (
                t("ticket.continue")
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function guideText(
  category: PublicIssueCategory,
  t: ReturnType<typeof useTranslations<"support">>,
): string {
  if (category === "account") return t("guides.accountId");
  if (category === "subscription") return t("guides.webAndStore");
  if (category === "payment") return t("guides.restoreCancelRefund");
  if (category === "refund") return t("guides.refund");
  return t("troubleshooting.title");
}

function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  const className = `inline-flex min-h-11 items-center text-accent-teal underline underline-offset-4 ${FOCUS}`;
  if (href.startsWith("/support#")) {
    return (
      <a href={href.slice("/support".length)} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ChoiceGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="@container">
      <div role="group" aria-label={label} className="grid grid-cols-1 gap-2 @min-[18rem]:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function ChoiceButton({
  pressed,
  onClick,
  icon,
  label,
  hint,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-start transition-colors ${FOCUS} ${
        pressed
          ? "border-accent-teal/50 bg-accent-teal/10"
          : "border-overlay/10 bg-bg-secondary/40 hover:border-accent-teal/30 hover:bg-bg-secondary/70"
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-teal text-text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block whitespace-normal break-words text-sm font-medium leading-snug text-text-primary">
          {label}
        </span>
        {hint && <span className="block text-xs text-text-tertiary">{hint}</span>}
      </span>
    </button>
  );
}

function PlatformMark({ platform }: { platform: DevicePlatform }) {
  if (platform === "ios" || platform === "macos") return <PlatformLogo icon="apple" className="h-5 w-5" />;
  if (platform === "android") return <PlatformLogo icon="android" className="h-5 w-5" />;
  if (platform === "windows") return <PlatformLogo icon="windows" className="h-5 w-5" />;
  if (platform === "web") return <Icon d={GLOBE} className="h-5 w-5" />;
  return <Icon d={QUESTION} className="h-5 w-5" />;
}

function ProviderMark({ provider }: { provider: PaymentProvider }) {
  if (provider === "app_store") return <PlatformLogo icon="apple" className="h-5 w-5" />;
  if (provider === "google_play") return <PlatformLogo icon="android" className="h-5 w-5" />;
  if (provider === "revolut") return <Icon d={CATEGORY_ICON.payment} className="h-5 w-5" />;
  if (provider === "unknown") return <Icon d={QUESTION} className="h-5 w-5" />;
  return <Icon d={CATEGORY_ICON.other} className="h-5 w-5" />;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  mono,
  autoComplete,
  invalid,
  describedBy,
  hint,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "ltr";
  mono?: boolean;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  hint?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label htmlFor={id} className={`${LABEL} text-text-muted`}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        dir={dir}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        style={mono ? MONO : undefined}
        className={`${INPUT} ${invalid ? "border-danger/60" : "border-overlay/10"}`}
      />
      {hint}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  ltr,
  pre,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  pre?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-text-tertiary">{label}</dt>
      <dd
        dir={ltr ? "ltr" : undefined}
        className={`mt-0.5 min-w-0 break-words text-text-primary ${pre ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Receipt({
  ticketNumber,
  destination,
  destinationText,
  showBot,
}: {
  ticketNumber: string;
  destination: string;
  destinationText: string;
  showBot: boolean;
}) {
  const t = useTranslations("support");
  const [copied, setCopied] = useState(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copyTicket = async () => {
    try {
      await navigator.clipboard.writeText(ticketNumber);
    } catch {
      return;
    }
    if (!alive.current) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">{t("ticket.successMessage", { ticketNumber })}</p>
      <div style={MONO} className="rounded-xl border border-overlay/10 bg-bg-primary/60 p-4 text-start text-sm">
        <label className="block text-[11px] uppercase tracking-wider text-text-tertiary" htmlFor="ticket-number">
          {t("ticket.receiptTicket")}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            id="ticket-number"
            readOnly
            dir="ltr"
            value={ticketNumber}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-accent-teal-light outline-none"
          />
          <button
            type="button"
            onClick={copyTicket}
            className={`cta-flat inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${FOCUS}`}
          >
            <Icon d={copied ? CHECK_PATH : COPY_PATH} className="h-3.5 w-3.5" strokeWidth={copied ? 2.5 : 1.75} />
            {copied ? t("ticket.copied") : t("ticket.copy")}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? t("ticket.copied") : ""}
        </span>
        <p className={`mt-3 border-t border-dashed border-overlay/10 pt-3 text-text-muted ${ROW_DELAYS[0]}`}>
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-text-tertiary">
            {t("ticket.receiptReplyTo")}
          </span>
          <span dir="ltr" className="break-all text-text-primary">
            {destination}
          </span>
        </p>
      </div>
      <p className="text-sm text-text-muted">{destinationText}</p>
      {showBot && (
        <p className="text-sm text-text-muted">
          <a
            href={CONTACT.telegram.supportBot}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center text-accent-teal underline underline-offset-4 ${FOCUS}`}
          >
            {t("ticket.botCta")}
          </a>
          <span className="mt-1 block text-xs">{t("ticket.botNote")}</span>
        </p>
      )}
      <p className="text-xs text-text-muted">
        <span aria-hidden="true" className="me-1 text-accent-teal-light">
          ✓
        </span>
        {t("ticket.receiptStatus")}
      </p>
    </div>
  );
}
