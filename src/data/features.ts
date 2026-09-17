import {
  Baby,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarHeart,
  CalendarRange,
  Church,
  Clock,
  Coins,
  Compass,
  CreditCard,
  Crown,
  Diamond,
  Download,
  Eye,
  FileText,
  Flame,
  Flower2,
  Gift,
  Gem,
  GitCompareArrows,
  Hand,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  Languages,
  LayoutGrid,
  MessageCircle,
  Moon,
  MoonStar,
  Newspaper,
  Orbit,
  Package,
  Phone,
  ScanFace,
  ScrollText,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Sun,
  SunMedium,
  TicketPercent,
  TimerReset,
  UserCheck,
  Users,
  Video,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { paths } from '@/routes/paths'

/**
 * Product catalogue — full competitive matrix (sections A–J).
 *
 * Status:
 * - `live` — reachable in the app today
 * - `planned` — on the roadmap from the matrix
 * - `undecided` — listed for discovery; not promised
 */

export type FeatureStatus = 'live' | 'planned' | 'undecided'

export interface Feature {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  glyph?: string
  status: FeatureStatus
  to?: string
  sourceDecision: string
  contents?: string[]
}

export interface FeatureGroup {
  id: string
  title: string
  description: string
  features: Feature[]
}

const chartSection = (section: string) => `${paths.chart}?section=${section}`

function planned(
  slug: string,
  title: string,
  description: string,
  icon: LucideIcon,
  sourceDecision: string,
  contents?: string[],
): Feature {
  return { slug, title, description, icon, status: 'planned', sourceDecision, contents }
}

function undecided(
  slug: string,
  title: string,
  description: string,
  icon: LucideIcon,
  sourceDecision: string,
): Feature {
  return { slug, title, description, icon, status: 'undecided', sourceDecision }
}

function horoscope(
  slug: string,
  title: string,
  description: string,
  icon: LucideIcon,
  sourceRow: string,
): Feature {
  return {
    slug: `horoscope-${slug}`,
    title,
    description,
    icon,
    status: 'live',
    to: paths.horoscope(slug),
    sourceDecision: sourceRow,
    contents: [
      'Written by Cyklos rather than syndicated',
      'Names the bhava and grahas it was read from',
      'A range rather than a single promise',
    ],
  }
}

export const featureGroups: FeatureGroup[] = [
  // ── A. Kundli and chart ──────────────────────────────────────────────
  {
    id: 'kundli-chart',
    title: 'Kundli and chart',
    description: 'Birth chart generation, tables, divisionals and saved profiles.',
    features: [
      {
        slug: 'birth-chart',
        title: 'Janam kundli / birth chart',
        description: 'Your rashi chart and house-style kundli.',
        icon: Compass,
        status: 'live',
        to: paths.chart,
        sourceDecision: 'A · Janam kundli / birth chart generation',
        contents: [
          'North Indian diamond kundli',
          'Lagna, Chandra and graha positions',
          'Switch profiles and divisional charts (vargas)',
        ],
      },
      planned(
        'kundli-pdf',
        'Kundli PDF download',
        'Export your full chart as a document you can keep.',
        Download,
        'A · Kundli PDF download',
        ['North Indian diamond chart', 'Graha and bhava tables', 'Share or print'],
      ),
      planned(
        'premium-kundli-report',
        'Detailed / premium kundli report',
        'A long-form reading of the whole chart.',
        FileText,
        'A · Detailed / premium kundli report',
      ),
      {
        slug: 'divisional-charts',
        title: 'Divisional charts (D9 and beyond)',
        description: 'Vargas from D1 through the higher divisionals.',
        icon: LayoutGrid,
        status: 'live',
        to: paths.chart,
        sourceDecision: 'A · Divisional charts (D9 and beyond)',
        contents: [
          'D-1 Rashi, D-9 Navamsa, D-10 Dashamsa and more',
          'Same diamond chart for every varga',
          'Open All 16 from the chart rail',
        ],
      },
      {
        slug: 'dasha',
        title: 'Dasha table (Vimshottari)',
        description: 'Mahadasha, antardasha and pratyantar.',
        icon: CalendarRange,
        status: 'live',
        to: chartSection('dasha'),
        sourceDecision: 'A · Dasha table (Vimshottari)',
        contents: [
          'Vimshottari mahadasha timeline',
          'Antardasha and finer periods',
          'Tied to your Moon nakshatra at birth',
        ],
      },
      {
        slug: 'grahas',
        title: 'Planetary positions table',
        description: 'Sign, degree, nakshatra, dignity and motion.',
        icon: Orbit,
        status: 'live',
        to: chartSection('grahas'),
        sourceDecision: 'A · Planetary positions table',
        contents: [
          'Degree and minute for each graha',
          'Nakshatra, pada and dignity',
          'Direct, retrograde and node motion',
        ],
      },
      {
        slug: 'lagna-calculator',
        title: 'Lagna / ascendant calculator',
        description: 'Rising sign and degree from birth details.',
        icon: Compass,
        status: 'live',
        to: chartSection('bhavas'),
        sourceDecision: 'A · Lagna / ascendant calculator',
        contents: [
          'Rising sign from your birth place and time',
          'House cusps against the lagna',
          'Edit birth details anytime from Profile',
        ],
      },
      planned(
        'moon-sign-calculator',
        'Moon sign (rashi) calculator',
        'Find Chandra rashi from birth data.',
        Moon,
        'A · Moon sign (rashi) calculator',
      ),
      planned(
        'sun-sign-calculator',
        'Sun sign calculator',
        'Surya rashi for the birth moment.',
        Sun,
        'A · Sun sign calculator',
      ),
      planned(
        'nakshatra-finder',
        'Nakshatra finder',
        'Birth star, pada and lord.',
        Sparkles,
        'A · Nakshatra finder',
      ),
      {
        slug: 'saved-charts',
        title: 'Multiple saved profiles / family charts',
        description: 'Family, friends and colleagues — each with their own chart.',
        icon: Users,
        status: 'live',
        to: paths.chart,
        sourceDecision: 'A · Multiple saved profiles / family charts',
        contents: [
          'Add family, friends and other charts',
          'Switch whose chart is on screen from the top bar',
          'Free accounts include two additional profiles',
        ],
      },
      planned(
        'kundli-regional-languages',
        'Kundli in regional languages',
        'Chart labels and reports in Hindi and regional languages.',
        Languages,
        'A · Kundli in regional languages',
      ),
      planned(
        'celebrity-charts',
        'Celebrity kundli database',
        'Read public charts the same way you read your own.',
        Star,
        'A · Celebrity kundli database',
      ),
      {
        slug: 'birth-time-rectification',
        title: 'Birth time rectification',
        description: 'Narrow an uncertain birth time from known life events.',
        icon: Clock,
        status: 'planned',
        sourceDecision: 'A · Birth time rectification',
        contents: [
          'Enter events with known dates',
          'Propose times that fit them',
          'Recalculate the chart',
        ],
      },
      {
        slug: 'bhavas',
        title: 'Bhavas',
        description: 'Twelve cusps, lords, and where each lord sits.',
        icon: LayoutGrid,
        status: 'live',
        to: chartSection('bhavas'),
        sourceDecision: 'A · Bhavas (chart houses)',
        contents: [
          'All twelve houses with significations',
          'Lord of each bhava and where that lord sits',
          'Tap a house on the diamond to focus notes',
        ],
      },
      {
        slug: 'drishti',
        title: 'Drishti',
        description: 'Which graha aspects which bhava.',
        icon: Eye,
        status: 'live',
        to: chartSection('drishti'),
        sourceDecision: 'A · Planetary aspects',
        contents: [
          'Classical graha aspects on houses',
          'See who looks at whom in the chart',
          'Focus a graha from the table or notes',
        ],
      },
      {
        slug: 'ashtakavarga',
        title: 'Ashtakavarga',
        description: 'Bindus per sign, read against the mean.',
        icon: BarChart3,
        status: 'live',
        to: chartSection('sav'),
        sourceDecision: 'A · Ashtakavarga',
        contents: [
          'Bindus for each bhava',
          'Read strength against the mean',
          'Useful alongside transit and dasha timing',
        ],
      },
    ],
  },

  // ── B. Matching and compatibility ────────────────────────────────────
  {
    id: 'matching',
    title: 'Matching and compatibility',
    description: 'Guna Milan, dosha checks and lighter love reads.',
    features: [
      {
        slug: 'kundli-matching',
        title: 'Kundli matching / Guna Milan (36 points)',
        description: 'Eight kootas across thirty-six points.',
        icon: HeartHandshake,
        status: 'live',
        to: paths.matching,
        sourceDecision: 'B · Kundli matching / guna milan (36 points)',
        contents: [
          'Ashta koota Guna Milan out of 36',
          'Plain-language strengths and frictions',
          'Match using saved profiles',
        ],
      },
      planned(
        'matching-pdf',
        'Matching PDF report',
        'Export the full Guna Milan as a document.',
        Download,
        'B · Matching PDF report',
      ),
      planned(
        'manglik-in-matching',
        'Manglik / dosha check inside matching',
        'Manglik status for both charts inside the match.',
        Flame,
        'B · Manglik / dosha check inside matching',
      ),
      {
        slug: 'love-compatibility',
        title: 'Zodiac love compatibility',
        description: 'A quick read — temperament, pace, mind and distance.',
        icon: Heart,
        status: 'live',
        to: paths.compatibility,
        sourceDecision: 'B · Zodiac love compatibility',
        contents: [
          'Temperament and pace between two charts',
          'Mind, emotion and distance at a glance',
          'Compare any two saved profiles',
        ],
      },
      planned(
        'love-calculator-flames',
        'Love calculator / FLAMES',
        'A light name-based compatibility play.',
        Heart,
        'B · Love calculator / FLAMES',
      ),
      planned(
        'marriage-timing',
        'Marriage prediction / timing report',
        'When the chart supports partnership, as a range.',
        CalendarCheck,
        'B · Marriage prediction / timing report',
      ),
    ],
  },

  // ── C. Horoscope and prediction ──────────────────────────────────────
  {
    id: 'horoscopes',
    title: 'Horoscope and prediction',
    description: 'Daily to yearly reads — personalised where the chart allows.',
    features: [
      horoscope('daily', 'Daily horoscope', 'What today reads like, from your chart.', Sun, 'C · Daily horoscope'),
      horoscope('tomorrow', 'Tomorrow’s horoscope', 'The next day, far enough to plan around.', SunMedium, 'C · Tomorrow’s horoscope'),
      horoscope('weekly', 'Weekly horoscope', 'The shape of the week.', CalendarDays, 'C · Weekly horoscope'),
      horoscope('monthly', 'Monthly horoscope', 'The month as one arc.', Calendar, 'C · Monthly horoscope'),
      horoscope('yearly', 'Yearly horoscope by sign', 'The year by sign, with shaping transits.', CalendarCheck, 'C · Yearly horoscope by sign (generic)'),
      horoscope('yearly-personal', 'Personalised yearly horoscope report', 'A full year from your chart, not your sign.', FileText, 'C · Personalised yearly horoscope report'),
      horoscope('love', 'Love horoscope', 'Bh 7 and Shukra for the period you are in.', Heart, 'C · Love horoscope'),
      horoscope('career', 'Career horoscope', 'Bh 10, its lord, and who aspects it.', Briefcase, 'C · Career horoscope'),
      horoscope('health', 'Health horoscope', 'Bh 6 and bh 1, with limits stated plainly.', HeartPulse, 'C · Health horoscope'),
      horoscope('finance', 'Finance / money horoscope', 'Bh 2 and bh 11 against their means.', Coins, 'C · Finance / money horoscope'),
      horoscope('lucky', 'Lucky number / colour / auspicious hours', 'From your chart’s own lords.', Sparkles, 'C · Lucky number / colour / auspicious hours'),
      horoscope('daily-personal', 'Personalised daily prediction from own kundli', 'Today from your kundli rather than your sign.', UserCheck, 'C · Personalised daily prediction from own kundli'),
      planned(
        'chinese-horoscope',
        'Chinese horoscope',
        'East Asian animal-year reading.',
        Star,
        'C · Chinese horoscope',
      ),
      horoscope('rashifal', 'Rashifal in Hindi and regional languages', 'The same readings in Hindi and regional languages.', Languages, 'C · Rashifal in Hindi and regional languages'),
    ],
  },

  // ── D. Panchang, calendar and muhurat ─────────────────────────────────
  {
    id: 'panchang',
    title: 'Panchang, calendar and muhurat',
    description: 'Daily almanac, festivals and auspicious windows.',
    features: [
      {
        slug: 'daily-panchang',
        title: 'Daily panchang',
        description: 'Tithi, yoga, karana and more for today.',
        icon: CalendarDays,
        status: 'live',
        to: paths.calendar,
        sourceDecision: 'D · Daily panchang',
        contents: [
          'Today’s tithi, yoga and karana',
          'Nakshatra and related markers',
          'Opens inside the Cyklos calendar',
        ],
      },
      planned('choghadiya', 'Choghadiya', 'Day and night muhurat segments.', Clock, 'D · Choghadiya'),
      planned('rahu-kaal', 'Rahu Kaal', 'Inauspicious hours for your location.', Moon, 'D · Rahu Kaal'),
      planned('hora', 'Hora', 'Planetary hours through the day.', Clock, 'D · Hora'),
      planned('tithi-nakshatra-today', 'Today’s tithi and nakshatra', 'Current lunar day and birth star.', Sparkles, 'D · Today’s tithi and nakshatra'),
      {
        slug: 'festival-calendar',
        title: 'Festival calendar',
        description: 'Hindu festivals for the year.',
        icon: Calendar,
        status: 'live',
        to: paths.calendar,
        sourceDecision: 'D · Festival calendar',
        contents: [
          'Major festivals on the month grid',
          'Tap a day for festival notes',
          'Aligned with the Hindu calendar view',
        ],
      },
      {
        slug: 'vrat-ekadashi',
        title: 'Vrat / Ekadashi calendar',
        description: 'Fasting days and observances.',
        icon: CalendarCheck,
        status: 'live',
        to: paths.calendar,
        sourceDecision: 'D · Vrat / Ekadashi calendar',
        contents: [
          'Ekadashi and other vrat days marked',
          'See observances in context of the month',
          'Part of the shared calendar surface',
        ],
      },
      planned('shubh-muhurat', 'Shubh muhurat lookup', 'Generic auspicious windows from classical tables.', CalendarRange, 'D · Shubh muhurat lookup (generic tables)'),
      {
        slug: 'hindu-calendar',
        title: 'Hindu calendar',
        description: 'Panchang-backed calendar view.',
        icon: CalendarDays,
        status: 'live',
        to: paths.calendar,
        sourceDecision: 'D · Hindu calendar',
        contents: [
          'Full month calendar with panchang cues',
          'Festivals and vrats in one place',
          'Jump to any day for detail',
        ],
      },
      planned('panchang-pdf-ical', 'Panchang PDF / iCal download', 'Export panchang or subscribe by calendar.', Download, 'D · Panchang PDF / iCal download'),
      planned('personalised-muhurat', 'Personalised muhurat from your own chart', 'Auspicious windows filtered by your kundli.', UserCheck, 'D · Personalised muhurat from your own chart'),
    ],
  },

  // ── E. Dosha and transit ─────────────────────────────────────────────
  {
    id: 'dosha-transit',
    title: 'Dosha calculators and transit reports',
    description: 'Mangal, Kaal Sarp, Sade Sati and major transits.',
    features: [
      planned('mangal-dosha', 'Mangal dosha calculator', 'Mars affliction check in the chart.', Flame, 'E · Mangal dosha calculator'),
      planned('kaal-sarp', 'Kaal Sarp dosh calculator', 'Rahu–Ketu axis dosha check.', Orbit, 'E · Kaal Sarp dosh calculator'),
      planned('sade-sati', 'Sade Sati calculator', 'Saturn’s seven-and-a-half year transit on the moon.', Orbit, 'E · Sade Sati calculator'),
      planned('pitra-dosha', 'Pitra dosha calculator', 'Ancestral dosha indicators in the chart.', Users, 'E · Pitra dosha calculator'),
      planned('paid-dosha-report', 'Paid dosha report', 'Long-form dosha analysis with remedies noted.', FileText, 'E · Paid dosha report'),
      planned('transit-report', 'Transit report (Saturn / Jupiter / Rahu-Ketu)', 'Major slow-planet transit report.', Orbit, 'E · Transit report (Saturn / Jupiter / Rahu-Ketu)'),
    ],
  },

  // ── F. Consultation ──────────────────────────────────────────────────
  {
    id: 'consultation',
    title: 'Consultation with an astrologer',
    description: 'Human and AI consultation — chat, call and packs.',
    features: [
      planned('chat-astrologer', 'Chat with astrologer', 'Text consultation with a verified astrologer.', MessageCircle, 'F · Chat with astrologer'),
      planned('call-astrologer', 'Call with astrologer', 'Voice consultation.', Phone, 'F · Call with astrologer'),
      planned('video-astrologer', 'Video call with astrologer', 'Face-to-face video session.', Video, 'F · Video call with astrologer'),
      undecided('live-astrologer-stream', 'Live astrologer streaming sessions', 'Watch live sessions from astrologers.', Video, 'F · Live astrologer streaming sessions'),
      planned('first-chat-free', 'First chat or call free', 'Introductory session at no charge.', Gift, 'F · First chat or call free'),
      planned('rupee-one-session', '₹1 first session', 'Token-priced first consultation.', Coins, 'F · ₹1 first session'),
      planned('free-first-minutes', 'Free first N minutes', 'Opening minutes complimentary.', Clock, 'F · Free first N minutes'),
      planned('wallet-recharge', 'Wallet and recharge', 'Balance for consultations and packs.', Wallet, 'F · Wallet and recharge'),
      planned('recharge-bonus', 'Recharge bonus', 'Extra credit on top-ups.', Gift, 'F · Recharge bonus'),
      planned('ask-question-pack', 'Ask-a-question paid pack', 'Bundled questions answered from your chart.', MessageCircle, 'F · Ask-a-question paid pack'),
      {
        slug: 'ai-astrologer-chat',
        title: 'AI astrologer chat',
        description: 'Ask your chart — answers cite house, grahas and period.',
        icon: Sparkles,
        status: 'live',
        to: paths.ask,
        sourceDecision: 'F · AI astrologer chat',
        contents: [
          'Ask in plain language about your chart',
          'Answers name bhava, grahas and dasha',
          'History keeps past threads to reopen',
        ],
      },
      planned('ai-voice-consult', 'AI voice / phone consultation', 'Spoken AI consultation from your chart.', Phone, 'F · AI voice / phone consultation'),
      undecided('astrologer-ratings', 'Astrologer ratings and reviews', 'Ratings after each session.', Star, 'F · Astrologer ratings and reviews'),
      undecided('astrologer-filters', 'Astrologer filters (language, skill, price)', 'Find the right astrologer quickly.', Users, 'F · Astrologer filters (language, skill, price)'),
      undecided('favourite-astrologer', 'Follow / favourite an astrologer', 'Save preferred consultants.', Heart, 'F · Follow / favourite an astrologer'),
      planned('appointment-booking', 'Queue or appointment booking', 'Book a slot instead of waiting live.', CalendarCheck, 'F · Queue or appointment booking'),
      planned('consult-languages', 'Consultation in multiple Indian languages', 'Sessions in Hindi and regional languages.', Languages, 'F · Consultation in multiple Indian languages'),
      planned('refund-policy', 'Refund / low-rating refund policy', 'Clear refund rules when a session goes poorly.', CreditCard, 'F · Refund / low-rating refund policy'),
    ],
  },

  // ── G. Paid reports ──────────────────────────────────────────────────
  {
    id: 'reports',
    title: 'Paid reports',
    description: 'Long-form life, career, marriage and specialty reports.',
    features: [
      planned('life-brihat-report', 'Life / Brihat report', 'Full life-path report from the chart.', FileText, 'G · Life / Brihat report'),
      planned('career-report', 'Career report', 'Work, standing and timing.', Briefcase, 'G · Career report'),
      planned('marriage-report', 'Marriage report', 'Partnership and timing from both charts.', HeartHandshake, 'G · Marriage report'),
      planned('finance-report', 'Finance / wealth report', 'Wealth yogas and money houses.', Coins, 'G · Finance / wealth report'),
      planned('health-report', 'Health / medical report', 'Health indicators with clear caveats.', HeartPulse, 'G · Health / medical report'),
      planned('education-child-report', 'Education / child report', 'Learning and children from the chart.', Baby, 'G · Education / child report'),
      planned('gemstone-report', 'Gemstone recommendation report', 'Stones suggested from the chart — not a prescription.', Gem, 'G · Gemstone recommendation report'),
      planned('numerology-report', 'Numerology report', 'Number-based life and name report.', Calculator, 'G · Numerology report'),
      undecided('vastu-report', 'Vastu report', 'Space and direction report.', Home, 'G · Vastu report'),
      planned('combo-report-bundles', 'Combo report bundles', 'Bundled reports at a package price.', Package, 'G · Combo report bundles'),
    ],
  },

  // ── H. Remedies, puja and commerce ───────────────────────────────────
  {
    id: 'remedies-commerce',
    title: 'Remedies, puja and commerce',
    description: 'Recommendations, ritual booking and related stores.',
    features: [
      planned('free-gemstone-tool', 'Free gemstone / rudraksha recommendation tool', 'Quick chart-based suggestion tool.', Gem, 'H · Free gemstone / rudraksha recommendation tool'),
      planned('gemstone-store', 'Gemstone store', 'Purchase recommended stones.', Store, 'H · Gemstone store'),
      planned('rudraksha-store', 'Rudraksha store', 'Rudraksha beads and malas.', Flower2, 'H · Rudraksha store'),
      planned('yantra-store', 'Yantra / kavach store', 'Yantras and protective items.', Sparkles, 'H · Yantra / kavach store'),
      planned('bracelet-store', 'Bracelet / crystal jewellery', 'Crystal and bracelet commerce.', ShoppingBag, 'H · Bracelet / crystal jewellery'),
      planned('puja-samagri', 'Puja samagri / kits', 'Ritual kits and supplies.', Package, 'H · Puja samagri / kits'),
      planned('online-puja', 'Online puja booking', 'Book a puja performed on your behalf.', Church, 'H · Online puja booking'),
      planned('group-puja', 'Group / community puja', 'Join collective rituals.', Users, 'H · Group / community puja'),
      planned('temple-chadhava', 'Temple chadhava / offering', 'Offerings at partner temples.', Gift, 'H · Temple chadhava / offering'),
      planned('prasad-delivery', 'Prasad delivery', 'Prasad shipped after offering.', Package, 'H · Prasad delivery'),
      planned('havan-booking', 'Havan / yagya booking', 'Book fire rituals.', Flame, 'H · Havan / yagya booking'),
      planned('daan-donation', 'Daan / donation', 'Charitable giving flows.', Heart, 'H · Daan / donation'),
      planned('free-remedy-mantra', 'Free remedy and mantra suggestions', 'Chart-linked mantras and simple remedies.', Sparkles, 'H · Free remedy and mantra suggestions'),
      undecided('healing-services', 'Healing services (Reiki, chakra, crystal)', 'Adjacent healing sessions.', HeartPulse, 'H · Healing services (Reiki, chakra, crystal)'),
    ],
  },

  // ── I. Other divination ──────────────────────────────────────────────
  {
    id: 'divination',
    title: 'Other divination',
    description: 'Tarot, numerology, palmistry and related tools.',
    features: [
      planned('tarot-reading', 'Tarot reading', 'Card draws with interpretive text.', Sparkles, 'I · Tarot reading'),
      planned('numerology-calculator', 'Numerology calculator', 'Life path and name numbers.', Calculator, 'I · Numerology calculator'),
      planned('palmistry', 'Palmistry', 'Palm reading from a photo or guide.', Hand, 'I · Palmistry'),
      planned('face-reading', 'Face reading', 'Physiognomy-style reading.', ScanFace, 'I · Face reading'),
      planned('vastu-consultation', 'Vastu consultation', 'Home and office direction guidance.', Home, 'I · Vastu consultation'),
      planned('baby-name', 'Baby name suggestion', 'Names filtered by nakshatra and sound.', Baby, 'I · Baby name suggestion'),
      undecided('name-correction', 'Name correction', 'Suggest name spelling changes.', Languages, 'I · Name correction'),
      undecided('mobile-vehicle-numerology', 'Mobile / vehicle number numerology', 'Number plates and phone numbers.', Smartphone, 'I · Mobile / vehicle number numerology'),
      undecided('dream-interpretation', 'Dream interpretation', 'Symbolic dream readings.', Moon, 'I · Dream interpretation'),
    ],
  },

  // ── J. Platform, content and engagement ──────────────────────────────
  {
    id: 'platform',
    title: 'Platform, content and engagement',
    description: 'Notifications, plans, content and retention.',
    features: [
      planned('notifications', 'Push notifications and daily alerts', 'A daily alert at a time you choose.', Bell, 'J · Push notifications and daily alerts'),
      planned('streaks', 'Streaks / daily check-in rewards', 'Quiet day count for checking in.', Flame, 'J · Streaks / daily check-in rewards'),
      planned('referrals', 'Referral rewards', 'Share Cyklos — both sides get something back.', Gift, 'J · Referral rewards'),
      planned('signup-reward', 'Signup wallet credit', 'What a new account starts with.', TicketPercent, 'J · Signup wallet credit'),
      planned('subscription', 'Subscription plan', 'What a plan unlocks, and what stays free.', Crown, 'J · Subscription plan'),
      planned('ad-free', 'Ad-free experience', 'No advertising in the product.', Eye, 'J · Ad-free experience'),
      planned('blog', 'Blog and articles', 'How the calculations actually work.', Newspaper, 'J · Blog and articles'),
      planned('devotional-content', 'Devotional content (bhajan, aarti, chalisa)', 'Audio and text devotionals.', Flower2, 'J · Devotional content (bhajan, aarti, chalisa)'),
      planned('learning-content', 'Astrology learning content', 'Explainers for beginners.', BookOpen, 'J · Astrology learning content'),
      planned('temple-directory', 'Temple directory', 'Find temples near you.', Building2, 'J · Temple directory'),
      planned('live-darshan', 'Live darshan / aarti stream', 'Stream temple rituals live.', Video, 'J · Live darshan / aarti stream'),
      planned('whatsapp-delivery', 'WhatsApp delivery of reports and videos', 'Send reports over WhatsApp.', MessageCircle, 'J · WhatsApp delivery of reports and videos'),
      planned('home-widget', 'Home-screen widget', 'Today’s reading without opening the app.', Smartphone, 'J · Home-screen widget'),
    ],
  },
]

/**
 * Sidebar / Tools lead capabilities — direct routes where they exist.
 */
export const primaryProductFeatures: Feature[] = [
  {
    slug: 'my-chart',
    title: 'My Chart',
    description: 'Your chart, section by section — planets, houses, dasha and more.',
    icon: Diamond,
    status: 'live',
    to: paths.chart,
    sourceDecision: 'Primary · My Chart',
    contents: [
      'Full kundli with grahas, bhavas and notes',
      'Dasha, drishti and ashtakavarga tabs',
      'Switch whose chart you are reading',
    ],
  },
  {
    slug: 'birth-time-rectification',
    title: 'Birth time rectification',
    description: 'Narrow an uncertain birth time from events you already know.',
    icon: TimerReset,
    status: 'planned',
    sourceDecision: 'A · Birth time rectification',
  },
  {
    slug: 'matching',
    title: 'Matching',
    description: 'Guna Milan across thirty-six points.',
    icon: HeartHandshake,
    status: 'live',
    to: paths.matching,
    sourceDecision: 'B · Kundli matching / guna milan',
    contents: [
      'Ashta koota score out of 36',
      'Clear reading of each koota',
      'Use two saved profiles',
    ],
  },
  {
    slug: 'kundli-matching-profiles',
    title: 'Kundli Matching with different profiles',
    description: 'Compare charts across saved profiles.',
    icon: GitCompareArrows,
    status: 'live',
    to: paths.compatibility,
    sourceDecision: 'B · Matching across profiles',
    contents: [
      'Pick any two people you have saved',
      'Compatibility beyond a single pair',
      'Open from Matching or All features',
    ],
  },
  {
    slug: 'horoscope',
    title: 'Horoscope',
    description: 'Daily and personalised readings from your chart.',
    icon: MoonStar,
    status: 'live',
    to: paths.horoscope('daily'),
    sourceDecision: 'C · Horoscope suite',
    contents: [
      'Daily and period readings from your kundli',
      'Names the houses and grahas used',
      'Love, career, health and more',
    ],
  },
  {
    slug: 'calendar',
    title: 'Calendar',
    description: 'Hindu calendar with panchang, festivals and vrats.',
    icon: CalendarHeart,
    status: 'live',
    to: paths.calendar,
    sourceDecision: 'D · Hindu calendar',
    contents: [
      'Month view with festivals and vrats',
      'Panchang-backed day details',
      'Plan around tithi and nakshatra',
    ],
  },
  {
    slug: 'panchang',
    title: 'Panchang',
    description: 'Tithi, nakshatra, choghadiya and auspicious hours.',
    icon: Sparkles,
    status: 'planned',
    sourceDecision: 'D · Daily panchang',
    contents: ['Today’s panchang', 'Tithi, nakshatra, yoga, karana', 'Muhurat windows'],
  },
  {
    slug: 'dosha',
    title: 'Dosha calculator',
    description: 'Mangal, Kaal Sarp, Sade Sati and Pitra dosha.',
    icon: Zap,
    status: 'planned',
    sourceDecision: 'E · Dosha calculators',
    contents: ['Mangal dosha', 'Kaal Sarp, Sade Sati, Pitra', 'Plain-language findings'],
  },
  {
    slug: 'reports',
    title: 'Reports',
    description: 'Life, career, marriage and finance reports.',
    icon: ScrollText,
    status: 'planned',
    sourceDecision: 'G · Paid reports',
    contents: ['Life, career, marriage, finance', 'Written against your chart', 'Save or share'],
  },
]

/** Standalone undecided entries not folded into a group (kept empty — matrix rows live in groups). */
export const undecidedFeatures: Feature[] = []

/** Historical exclusions — matrix now catalogs these as planned/undecided instead. */
export const excludedFromProduct: { title: string; reason: string }[] = []

export const allFeatures: Feature[] = (() => {
  const bySlug = new Map<string, Feature>()
  for (const feature of [
    ...featureGroups.flatMap((group) => group.features),
    ...undecidedFeatures,
    ...primaryProductFeatures,
  ]) {
    bySlug.set(feature.slug, feature)
  }
  return [...bySlug.values()]
})()

export function featureBySlug(slug: string): Feature | undefined {
  return (
    primaryProductFeatures.find((feature) => feature.slug === slug) ??
    allFeatures.find((feature) => feature.slug === slug)
  )
}

/** Features available in the product today — used by All features and nav. */
export function isLiveFeature(feature: Feature): boolean {
  return feature.status === 'live'
}

export const liveFeatureGroups: FeatureGroup[] = featureGroups
  .map((group) => ({
    ...group,
    features: group.features.filter(isLiveFeature),
  }))
  .filter((group) => group.features.length > 0)

export const livePrimaryFeatures: Feature[] = primaryProductFeatures.filter(isLiveFeature)

export const liveFeatures: Feature[] = (() => {
  const bySlug = new Map<string, Feature>()
  for (const feature of [
    ...liveFeatureGroups.flatMap((group) => group.features),
    ...livePrimaryFeatures,
  ]) {
    bySlug.set(feature.slug, feature)
  }
  return [...bySlug.values()]
})()

const GLYPH_BY_SLUG: Record<string, string> = {
  'birth-chart': '\u2295',
  grahas: '\u2609\uFE0E',
  bhavas: '\u2302',
  drishti: '\u21C4',
  dasha: '\u263D\uFE0E',
  ashtakavarga: '\u2058',
  'divisional-charts': '\u2298',
  'saved-charts': '\u25CC',
  'birth-time-rectification': '\u29D6',
  'celebrity-charts': '\u2726',
  'kundli-pdf': '\u2295',
  'horoscope-daily': '\u2609\uFE0E',
  'horoscope-tomorrow': '\u2609\uFE0E',
  'horoscope-weekly': '\u2726',
  'horoscope-monthly': '\u263D\uFE0E',
  'horoscope-yearly': '\u2648\uFE0E',
  'horoscope-yearly-personal': '\u2295',
  'horoscope-love': '\u2640\uFE0E',
  'horoscope-career': '\u2644\uFE0E',
  'horoscope-health': '\u2649\uFE0E',
  'horoscope-finance': '\u2643\uFE0E',
  'horoscope-lucky': '\u2727',
  'horoscope-daily-personal': '\u2295',
  'horoscope-rashifal': '\u264B\uFE0E',
  'kundli-matching': '\u260A',
  'love-compatibility': '\u2640\uFE0E',
  kundli: '\u2652',
  'my-chart': '\u2652',
  matching: '\u260A',
  'kundli-matching-profiles': '\u260B',
  horoscope: '\u2609\uFE0E',
  calendar: '\u263D\uFE0E',
  panchang: '\u263E\uFE0E',
  dosha: '\u2642\uFE0E',
  reports: '\u2295',
  'ai-astrologer-chat': '\u2726',
  'daily-panchang': '\u263E\uFE0E',
  'mangal-dosha': '\u2642\uFE0E',
}

for (const group of featureGroups) {
  for (const feature of group.features) {
    feature.glyph = GLYPH_BY_SLUG[feature.slug]
  }
}
for (const feature of primaryProductFeatures) {
  feature.glyph = GLYPH_BY_SLUG[feature.slug]
}
for (const feature of undecidedFeatures) {
  feature.glyph = GLYPH_BY_SLUG[feature.slug]
}
