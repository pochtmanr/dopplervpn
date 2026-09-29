# Refund KB handoff — 28 September 2026

## Approved knowledge base

Version `2026-09-28` in `doppler-support-bot/knowledge/articles/catalog.json`.

The bot prompt loads only articles with status `approved` and lifecycle `current`. The approved refund article is `refund-requests`, policy version `published-statement-2026-08`. It states the published 14-day and 30-day windows and the request steps. It does not deduct a processor fee, a network fee, or a price change, and it does not promise a number of days.

Excluded from retrieval:

- `refund-kb-2026-09-17` — superseded. It still contains the old fee sentences.
- `refund-policy-draft-2026-09-28` — draft. It is not a customer promise.

## Link registry

Version `2026-09-28` in `doppler-web/contracts/support/v1/link-registry.json`, copied to `doppler-support-bot`.

`pricing` is `/{locale}#pricing`. There is no `/pricing` route. New help pages: `/help/account-id`, `/help/web-and-store`, `/help/restore-cancel-refund`. Refund anchors: `#revolut-card`, `#oxapay`, `#app-store`, `#google-play`.

## Refund matrix

Version `2026-09-28`, status `research`, in `contracts/refund/v1/refund-decision-matrix.json` in both repos. For the worked example of $6.99 paid and $0.15 gateway cost, no branch sets the customer amount to $6.84. UK statutory cancellation, an approved full reversal, and the unpublished goodwill proposal are $6.99 gross. Store branches and unconfirmed rails have no merchant amount.

## Unresolved gates

- Owner approval to replace the published goodwill wording with a simpler full-gross rule.
- OxaPay merchant terms, asset, network, precision, payout minimum, and any return fee.
- Whether Revolut returns the acquiring fee.
- The purchaser's jurisdiction. Language is not residence.
- Sanctions enforcement beyond the EU-member checkout redirect. Russia is not in that redirect. The terms warranty is not a payment block.
- DMCC Act 2024 subscription rules: announced for January 2027, not in force on 28 September 2026.
- Historic store purchases are outside the website country redirect.
- Public URL for removing only a support contact.
- Checkout consent sentence. The pay button does not use the draft.
- The bot still says replies are usually within 24 hours. That is not a confirmed service level.

Drafts live in `doppler-web/content/policy-drafts/2026-09-28/` and are not imported by the site or the bot.
