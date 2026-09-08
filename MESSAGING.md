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
   switching filtering off locks the child's chosen apps until it's back on. On
   Android, parents choose the level: the standard setup is tamper-evident (you're
   alerted), and the fresh-phone setup is tamper-proof — Zaksha can't be uninstalled
   from the phone.
4. **Schedules and per-child rules.** Internet off at bedtime, on after homework —
   time windows per day, set per child or per device, all from one dashboard.

Supporting points (true, use freely): 7-day history then deleted for good; domains only,
never messages or page content; data stays in India; ₹199/month for the household,
5 devices included and expandable — parents can ask us for more (no hard cap beyond
fair use); UPI or card, cancel anytime; managed service — nothing to host.

## Anti-bypass language (non-negotiable)

Home in general is **tamper-resistant**, not **tamper-proof**. Three setups earn the word
tamper-proof, because enforcement genuinely can't be removed: the **Android fresh-phone
(device-owner) setup** — a Home option parents can choose over the standard
tamper-evident install; the **Windows standard-user setup** — the child on a Standard
(non-administrator) Windows account while the parent keeps the admin password, so the
machine-wide system service can't be stopped or uninstalled; and the **Enterprise/MDM
track** (supervised fleets, schools.html). Never apply tamper-proof to the iPhone story
or to Home as a whole.

Say for Home: "hard to bypass", "built to stay on", "hard to switch off without you",
"tamper-resistant"; for the Android fresh-phone setup specifically, "tamper-proof —
can't be uninstalled from the phone" is accurate and allowed; for the Windows
standard-user setup specifically, "installed by you, not removable by them — a standard
account can't stop or uninstall it" is accurate and allowed.

The honest caveat, always nearby when we make the anti-bypass claim: on iPhone the
Screen Time passcode does the pinning, and Apple lets the Apple ID password reset that
passcode — so the parent's Apple ID password is the real key. On Windows the admin
password is the real key, the same shape: someone with it — or who wipes and reinstalls
Windows — can still remove Zaksha, and if the child's own account is an administrator it
drops back to tamper-evident + alert. We say this plainly; it's also why the claim is
credible.

Never say for Home overall (or for iPhone): tamper-proof, unbypassable, impossible to
remove, "magic wall", 100% / guaranteed blocking.

## Claims we must NOT make (as of 2026-09-04)

- **Content allow lists** — DNS content filtering has no allow side for Home (category
  toggles + a block list of 5 custom rules per device); don't claim a content allow-list.
  But the iOS tamper lock IS shield-all with parent-chosen **allowed apps** (exemptions set
  in Manage — the "You set the terms" shot), so "block and allow lists" / "the apps you
  allow" is accurate for the iOS app side.
- **Real-time dashboard** — activity is computed in batches (~30 min). Say "what was
  blocked today", never "live" or "real-time".
- **UPI Autopay / auto-renewing subscription** — verify against prod before claiming;
  "pay by UPI or card, monthly or annual, cancel anytime" is always safe.
- **Unlimited devices** — it's 5 included, expandable on request.
- **Email alerts** — removed; the channels are WhatsApp and push.

## Landing pages

| Page | Job | Notes |
|---|---|---|
| `/` | Main Home landing: brand searches, organic, ads without a closer-matched lander | Family story only; Enterprise appears once, in pricing |
| `/get.html` | Install steps per platform | Linked post-signup and from CTAs |
| `/block.html` | Ad lander: "block porn/adult sites" search intent | `?ref=GS-BLOCK1`; unlisted, noindex |
| `/parental-control-android.html` | Ad lander: Family Link / parental-control comparison intent | `?ref=GS-PCA1`; unlisted, noindex |
| `/parental-control-windows.html` | Ad lander (AG5): "parental control for Windows/PC" intent | `?ref=GS-WIN1`; unlisted, noindex; leads with tamper-proof + the Standard-account qualifier |
| `/schools.html` | Enterprise + schools | Unlisted; the only place unqualified MDM tamper-proof language is allowed |
| `/pricing.html` | Redirect to `/#pricing` | Ads may link it directly |

Every published link carries a channel ref code (`GS-*` search, `IG-*` Instagram, `YT-*`,
`WA-*`) — attribution is our own referral-code system, no pixels, ever.

## Voice

Plain, specific, a little dry. Numbers over adjectives (₹199, 5 devices, 7 days — not
"affordable", "generous", "strong"). Admit limits before the reader finds them. No
exclamation marks, no fear-mongering about children; parents know why they're here.
