import type { SportsMatch } from "@/lib/sports/types";

export type SearchResultType = "game" | "sport" | "page";

export type SearchResultAction =
  | { kind: "view"; view: string; matchId?: string }
  | { kind: "external"; href: string };

export type SearchResultItem = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  /** Lowercased haystack for filtering */
  keywords: string;
  action: SearchResultAction;
};

const PAGE_ITEMS: Omit<SearchResultItem, "id">[] = [
  {
    type: "page",
    title: "Casino",
    subtitle: "Lobby & games",
    keywords: "casino lobby floor games originals",
    action: { kind: "view", view: "casino" },
  },
  {
    type: "page",
    title: "Sportsbook",
    subtitle: "Demo odds & slip",
    keywords: "sports sportsbook betting odds live upcoming",
    action: { kind: "view", view: "sports" },
  },
  {
    type: "page",
    title: "Wallet",
    subtitle: "Demo DBAK balance",
    keywords: "wallet balance coins dbaak funds",
    action: { kind: "view", view: "wallet" },
  },
  {
    type: "page",
    title: "Profile",
    subtitle: "Account & verification",
    keywords: "profile account user settings kyc",
    action: { kind: "view", view: "profile" },
  },
  {
    type: "page",
    title: "Rewards",
    subtitle: "Demo rakeback",
    keywords: "rewards vip promotions bonus",
    action: { kind: "view", view: "rewards" },
  },
  {
    type: "page",
    title: "Leaderboard",
    subtitle: "Demo rankings",
    keywords: "leaderboard ranking top players",
    action: { kind: "view", view: "leaderboard" },
  },
  {
    type: "page",
    title: "Responsible Play",
    subtitle: "Disclosures & limits info",
    keywords: "responsible play gambling limits help",
    action: { kind: "view", view: "responsible-play" },
  },
  {
    type: "page",
    title: "Support",
    subtitle: "Contact the MADBAK team",
    keywords: "support help contact account issue verification",
    action: { kind: "view", view: "support" },
  },
  {
    type: "page",
    title: "Terms",
    subtitle: "Demo terms",
    keywords: "terms legal policy",
    action: { kind: "view", view: "terms" },
  },
  {
    type: "page",
    title: "Home",
    subtitle: "Madbak House lobby",
    keywords: "home landing start",
    action: { kind: "view", view: "home" },
  },
];

const GAME_DEFS: { slug: string; title: string; keywords: string }[] = [
  { slug: "crash", title: "Crash", keywords: "crash multiplier rocket original" },
  { slug: "dice", title: "Dice", keywords: "dice roll original" },
  { slug: "mines", title: "Mines", keywords: "mines bomb grid original" },
  { slug: "plinko", title: "Plinko", keywords: "plinko pegs ball original" },
  { slug: "blackjack", title: "Blackjack", keywords: "blackjack bj 21 card table" },
  { slug: "roulette", title: "Roulette", keywords: "roulette wheel european table spin" },
  { slug: "slots", title: "Slots", keywords: "slots reels spin jackpot" },
  { slug: "coinflip", title: "Coinflip", keywords: "coin flip heads tails" },
  { slug: "keno", title: "Keno", keywords: "keno lottery numbers" },
  { slug: "baccarat", title: "Baccarat", keywords: "baccarat punto banco card" },
  { slug: "jackpot-slots", title: "Jackpot Slots", keywords: "jackpot slots mega prize" },
  { slug: "classic-slots", title: "Classic Slots", keywords: "classic slots fruit retro" },
];

function matchToSearchItems(matches: SportsMatch[]): SearchResultItem[] {
  return matches.flatMap((m) => {
    const title = `${m.homeTeam} vs ${m.awayTeam}`;
    const subtitle = `${m.league} · ${m.country}`;
    const keywords = [
      m.sport,
      m.league,
      m.country,
      m.homeTeam,
      m.awayTeam,
      title,
    ]
      .join(" ")
      .toLowerCase();
    return [
      {
        id: `sport-match-${m.id}`,
        type: "sport",
        title,
        subtitle,
        keywords,
        action: { kind: "view", view: "sports", matchId: m.id },
      },
      {
        id: `sport-league-${m.id}`,
        type: "sport",
        title: m.league,
        subtitle: `League · ${m.country}`,
        keywords: `${m.league} ${m.country} ${m.sport}`.toLowerCase(),
        action: { kind: "view", view: "sports", matchId: m.id },
      },
    ];
  });
}

export function buildSearchIndex(matches: SportsMatch[]): SearchResultItem[] {
  const games: SearchResultItem[] = GAME_DEFS.map((g) => ({
    id: `game-${g.slug}`,
    type: "game" as const,
    title: g.title,
    subtitle: "Casino game",
    keywords: `${g.title} ${g.keywords}`.toLowerCase(),
    action: { kind: "view", view: `game-${g.slug}` },
  }));

  const pages: SearchResultItem[] = PAGE_ITEMS.map((p, i) => ({
    ...p,
    id: `page-${i}-${p.title}`,
  }));

  return [...games, ...matchToSearchItems(matches), ...pages];
}

export function filterSearchResults(index: SearchResultItem[], rawQuery: string): SearchResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  return index.filter((item) => item.keywords.includes(q) || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q));
}

export function navigateFromSearch(
  item: SearchResultItem,
  ctx: {
    setView: (v: string) => void;
    onSportsMatchFocus?: (matchId: string) => void;
  },
): void {
  const { action } = item;
  if (action.kind === "external") {
    if (typeof window !== "undefined") window.location.href = action.href;
    return;
  }
  ctx.setView(action.view);
  if (action.view === "sports" && action.matchId && ctx.onSportsMatchFocus) {
    ctx.onSportsMatchFocus(action.matchId);
  }
}
