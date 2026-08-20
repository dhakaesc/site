/**
 * The six categories shown in "Who you will meet here" on the homepage.
 * Clicking one filters /browse down to that category.
 */
export const CATEGORIES = [
  {
    slug: "drama-models",
    cover: "/categories/drama-models.webp",
    icon: "film",
    tone: "p1",
    title: "Bangladeshi drama models",
    desc: "Verified profiles of familiar faces from television and web dramas, here for real conversations, not fan mail.",
  },
  {
    slug: "influencers",
    cover: "/categories/influencers.webp",
    icon: "bolt",
    tone: "p6",
    title: "Instagram & TikTok influencers",
    desc: "Content creators and social personalities with verified profiles, looking for something genuine off-camera.",
  },
  {
    slug: "single-parents",
    cover: "/categories/single-parents.webp",
    icon: "heart",
    tone: "p4",
    title: "Divorced & single parents welcome",
    desc: "A judgment-free space for divorced members and single mothers ready to date again — no assumptions, no awkward questions.",
  },
  {
    slug: "professionals",
    cover: "/categories/professionals.webp",
    icon: "shield",
    tone: "p2",
    title: "Verified professionals",
    desc: "Occupation and, optionally, income verification for members who want to signal they are serious and established.",
  },
  {
    slug: "students",
    cover: "/categories/students.webp",
    icon: "check",
    tone: "p5",
    title: "College/University students",
    desc: "Valid student ID verification opens a safe, age-appropriate space to meet people on and off campus.",
  },
  {
    slug: "news-presenters",
    cover: "/categories/news-presenters.webp",
    icon: "star",
    tone: "p3",
    title: "News presenters (women)",
    desc: "Verified profiles of familiar broadcast faces, here for genuine conversations away from the camera.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as readonly string[];

export function categoryTitle(slug: string | null | undefined) {
  return CATEGORIES.find((c) => c.slug === slug)?.title ?? null;
}
