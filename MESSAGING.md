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

Homepage hero (what-first, since 2026-10-24; replaced "Let them have the phone. You can
stop watching it.", which never said what Zaksha is): "Parental controls your child
can't quietly switch off." — support line: "Block adult content, games and social media
on every phone and laptop your kids use. Set bedtime and study hours. Get an alert the
moment it's switched off." "Quietly" is deliberate: on iPhone a child can switch
filtering off, but the parent is alerted and the chosen apps lock.

## Who it's for

Indian parents with school-age kids and a mix of devices — an Android phone, maybe an
iPhone, a Windows laptop for classes. They've tried router settings or Family Link and
found the gap: rules that stop at the front door, or that the kid switched off in a week.
Price-sensitive, WhatsApp-first, pay by UPI. English copy, Indian context (exam prep,
study hours, one phone shared in the family).

Enterprise (schools, colleges, companies) is a separate track with its own pages (the `/business` hub and one solution page per buyer) — never fold it into
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

Pricing display (site, since 2026-09-16): list price **₹249/month**, shown with a
time-bound **Diwali offer of ₹199/month** (₹149/mo billed yearly). The ₹199/₹149 offer
prices are exactly what checkout charges today, so the offer is honest to run now; the
₹249 list price only becomes a real claim once the PWA/Razorpay checkout is updated to
charge it after the festive offer ends (not yet done — track before the offer lapses).
Discount framing: "Diwali sale · up to 40% off" — annual ₹149/mo is 40% off ₹249, monthly
₹199 is 20% off; "up to 40%" covers both honestly.

Free trial (verified in `gates.go` — `const trialDays = 14`, first charge deferred):
every account starts with a **14-day free trial**. Safe to lead CTAs with "Start your
free trial" / "14 days free, then ₹199/month · cancel anytime". Don't use "Free to Start"
(ads-policy phrasing to avoid); a plain "free trial" is fine. The trial is subscribe-first: UPI or a card is set up to
start it, and an automated reminder goes out 3 days before the first charge (confirmed
2026-10-24). Never say "no card" — "we remind you 3 days before the first charge" is the
safe line.

## Block list scale (updated 2026-10-27)

Approximate counts from the upstream lists the product loads. Rounded DOWN with a "+" so they
stay true as the lists shift. Do not state exact figures.

- Adult sites: **90K+**
- Malware & phishing: **24 Lakh+**. Check the internal card before changing this figure or
  using it anywhere new (ads, decks, replies).
- Ad & tracker domains: **2 Lakh+**
- On the block list overall: **30 Lakh+**. Same rule as malware & phishing.

Scam and phishing protection (Basic Security) is on by default for every Home device, so "known
scam and phishing sites blocked for everyone at home" is safe. The lists are global threat feeds:
don't claim India-specific (UPI/KYC) scam coverage, and never claim it stops every scam.

## Anti-bypass language (non-negotiable)

Home in general is **tamper-resistant**, not **tamper-proof**. Two setups earn the word
tamper-proof, because enforcement genuinely can't be removed: the **Android fresh-phone
(device-owner) setup** — a Home option parents can choose over the standard
tamper-evident install — and the **Enterprise/MDM track** (supervised fleets,
`/business`). Never apply tamper-proof to the iPhone or Windows story, or to Home as a
whole. **Windows** (standard-user setup) is strongly tamper-resistant — a machine-wide
system service that's hard to switch off without the admin password — but we do **not**
lead with a "not removable" / tamper-proof claim.

Say for Home: "hard to bypass", "built to stay on", "hard to switch off without you",
"tamper-resistant"; for the Android fresh-phone setup specifically, "tamper-proof —
can't be uninstalled from the phone" is accurate and allowed; for the Windows
standard-user setup specifically, "built to stay on — hard to switch off without the
admin password" is the framing (not "not removable by them").

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
| `/parental-control-windows.html` | Ad lander (AG5): "parental control for Windows/PC" intent | `?ref=GS-WIN1`; unlisted, noindex; tamper-resistant framing ("built to stay on"), not a tamper-proof claim |
| `/business` | Business hub: the three solutions, what changes, devices, Wi-Fi (incl. public Wi-Fi), pricing, enquiry form | Indexed. Not an ad target; ads land on a solution page |
| `/schools-and-colleges`, `/small-business`, `/enterprise` | One solution page per buyer, family-page components | Indexed. Ad target with `?ref=GS-ENT-…` |
| `/schools`, `/colleges` | Redirect to `/schools-and-colleges` | noindex, canonical to `/schools-and-colleges` |
| `/pricing.html` | Redirect to `/#pricing` | Ads may link it directly |

Every published link carries a channel ref code (`GS-*` search, `IG-*` Instagram, `YT-*`,
`WA-*`) — attribution is our own referral-code system, no pixels, ever.

## Voice

Plain, specific, a little dry. Numbers over adjectives (₹199, 5 devices, 7 days — not
"affordable", "generous", "strong"). Admit limits before the reader finds them. No
exclamation marks, no fear-mongering about children; parents know why they're here.

## Enterprise ref codes

Enterprise ads land on the solution page for their segment with `?ref=GS-ENT-<code>` (for example
`/schools-and-colleges?ref=GS-ENT-SCH1`). `lead-form.js` sends that ref, plus the allowlisted click
params (`gclid` …), to `/api/v1/public/leads`; the page never sets a ref itself, so organic enquiries
carry none. The visitor picks the segment in the form. Enterprise pricing copy (Vasu, 2026-10-20): "From ₹79 per device / month", "Minimum 10 devices" on
`/small-business` only (ADR 0087); the hub, `/enterprise` and `/schools-and-colleges` say "Volume pricing" with
"Priced by number of devices." and no number. Every pricing card holds the demo and the pilot. Pilot, everywhere:
"a free 30-day pilot on one office or group, with success criteria agreed up front"; the quote comes after it. Never claim SOC2, ISO or "compliance-ready".
`/small-business` also offers a self-serve **14-day free trial, up to 5 devices** (kuchbhi ADR 0114, 2026-10-27):
"Start 14-day free trial" → `https://app.zaksha.com/signup?type=business&segment=<type>` (the enquiry form's organisation type) is the hero's first button, "Talk to us"
the second, and the pilot is offered to teams of more than 5. `icons.js` forwards `ref` and the click params on app
links. Don't write "no card" on the site (the site check forbids it everywhere, for the Home trial's sake).
Amended 2026-10-28 (kuchbhi ADR 0114 amendment): `/enterprise` and `/schools-and-colleges` offer the same trial. Hero:
"Start 14-day free trial" first; the second button stays "Talk to us" (`/enterprise`) or "Start a free 30-day pilot"
(`/schools-and-colleges`), and the note under them sends whole-office or whole-lab rollouts to the pilot. The `/business` hub stays quote-only.
Amended 2026-10-29: `/schools-and-colleges` also uses "Talk to us" as the second button. Two free buttons side by side
confused visitors; the pilot stays in the note under the buttons.
Amended 2026-10-29: the 30-day pilot is retired everywhere. Pricing cards offer the 14-day trial and the demo, the
quote comes after the trial, heroes carry no note under the buttons, and the Home pages' Business card reads
"Volume pricing · 14-day free trial". This supersedes every pilot line above.
Amended 2026-10-30: the `/business` hub's pricing section shows one card per audience; only Small business shows a price ("From ₹79 per
device / month"). Schools and colleges says "Discounted rates for schools, colleges and registered non-profits.",
Enterprise "For many sites, teams and complex rollouts."; both go to Talk to us. Then an "Every plan includes" list.
Single sign-on for the team, API access, SIEM log streaming and router setup are on every plan, listed under "Every
plan includes" with a `*` and the footnote "*We set this up with you during onboarding." Never frame them as an add-on
or "on request". The owner keeps email and password; single sign-on is for their team.
