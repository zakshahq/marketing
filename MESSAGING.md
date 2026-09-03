# Zaksha Home — messaging spine

The single source for what we say about the Home product — site pages, Google Ads,
Instagram, WhatsApp replies, App Store copy. If a claim isn't in here, check it against
the product before publishing it.

Product facts verified against the app + control plane on **2026-09-04**. When the product
changes, update this file in the same push as the site change that uses it.

## What Zaksha is (one line)

> Zaksha is a parental-control service for Indian families: it blocks adult content and
> other categories on every device your kids use, on any network, and it's built to stay
> on when they try to turn it off.

Shorter, for ads (30-char headline territory): "Parental controls that hold."

## Who it's for

Indian parents with school-age kids and a mix of devices — an Android phone, maybe an
iPhone, a Windows laptop for classes. They've tried router settings or Family Link and
found the gap: rules that stop at the front door, or that the kid switched off in a week.
Price-sensitive, WhatsApp-first, pay by UPI. English copy, Indian context (exam prep,
study hours, one phone shared in the family).

Enterprise (offices, schools) is a separate track with its own page — never fold it into
the Home story, and never frame Home as a small-business product.

## The four things it does

Lead with these, in this order. Each line is safe to use verbatim.

1. **Blocks whole categories, including adult content.** Adult, gambling, social media,
   gaming, streaming — and AI chatbots (ChatGPT, Gemini and the rest, useful during exam
   season) — each category one switch, set per child. Parents can also block specific
   sites of their own.
2. **An app on the device, not just Wi-Fi rules.** Native Zaksha app on iPhone and
   Android, a small agent on Windows, a configuration profile on Mac. Filtering travels
   with the device — mobile data, a friend's Wi-Fi, anywhere.
3. **Built to stay on.** Turning filtering off doesn't go unnoticed: parents get a
   WhatsApp message and a push alert the moment a device stops filtering. On iPhone,
   switching filtering off locks the child's chosen apps until it's back on (see the
   gate below). On Android, the fresh-phone setup locks Zaksha on so it can't be
   uninstalled from the phone.
4. **Schedules and per-child rules.** Internet off at bedtime, on after homework —
   time windows per day, set per child or per device, all from one dashboard.

Supporting points (true, use freely): 7-day history then deleted for good; domains only,
never messages or page content; data stays in India; ₹199/month for the household,
5 devices included, expandable to 10; UPI or card, cancel anytime; managed service —
nothing to host.

## Anti-bypass language (non-negotiable)

Home is **tamper-resistant**, never **tamper-proof**. Only the Enterprise/MDM track
(supervised fleets, schools.html) may say tamper-proof.

Say for Home: "hard to bypass", "built to stay on", "hard to switch off without you",
"tamper-resistant", "locks Zaksha on" (Android fresh-phone setup — describe the effect,
don't use the word tamper-proof even though the in-app label currently says it).

The honest caveat, always nearby when we make the anti-bypass claim: on iPhone the
Screen Time passcode does the pinning, and Apple lets the Apple ID password reset that
passcode — so the parent's Apple ID password is the real key. We say this plainly; it's
also why the claim is credible.

Never say for Home: tamper-proof, unbypassable, impossible to remove, "magic wall",
100% / guaranteed blocking.

## Claims we must NOT make (as of 2026-09-04)

- **iOS tamper lock (apps pause when filtering is turned off)** — in the 1.1/1.2
  binaries, NOT in the App Store build customers download today (v1.0). Don't publish
  this claim until the 1.2 build is live on the App Store. The site sections that make
  it are staged behind that gate.
- **Allow lists** — not built for Home. Parents get category toggles plus their own
  block list (5 custom rules per device). Say "your own block list", not "block and
  allow lists".
- **Real-time dashboard** — activity is computed in batches (~30 min). Say "what was
  blocked today", never "live" or "real-time".
- **UPI Autopay / auto-renewing subscription** — verify against prod before claiming;
  "pay by UPI or card, monthly or annual, cancel anytime" is always safe.
- **Unlimited devices** — it's 5 included, expandable to 10.
- **Email alerts** — removed; the channels are WhatsApp and push.

## Landing pages

| Page | Job | Notes |
|---|---|---|
| `/` | Main Home landing: brand searches, organic, ads without a closer-matched lander | Family story only; Enterprise appears once, in pricing |
| `/get.html` | Install steps per platform | Linked post-signup and from CTAs |
| `/block.html` | Ad lander: "block porn/adult sites" search intent | `?ref=GS-BLOCK1`; unlisted, noindex |
| `/parental-control-android.html` | Ad lander: Family Link / parental-control comparison intent | `?ref=GS-PCA1`; unlisted, noindex |
| `/schools.html` | Enterprise + schools | Unlisted; the only place tamper-proof (MDM) language is allowed |
| `/pricing.html` | Redirect to `/#pricing` | Ads may link it directly |

Every published link carries a channel ref code (`GS-*` search, `IG-*` Instagram, `YT-*`,
`WA-*`) — attribution is our own referral-code system, no pixels, ever.

## Voice

Plain, specific, a little dry. Numbers over adjectives (₹199, 5 devices, 7 days — not
"affordable", "generous", "strong"). Admit limits before the reader finds them. No
exclamation marks, no fear-mongering about children; parents know why they're here.
