export type WorkArtifactType = "demo" | "repo" | "doc";

export interface WorkMetric {
  label: string;
  value: string;
}

export interface WorkArtifact {
  label: string;
  url: string;
  type: WorkArtifactType;
}

export interface WorkItem {
  slug: string;
  title?: string;
  organization: string;
  roleTitle: string;
  period?: string;
  periodLabel: string;
  role?: string;
  location?: string;
  summary: string;
  highlights: string[];
  impactPoints?: string[];
  evidenceTags?: string[];
  toolsOrDomains?: string[];
  problem?: string;
  approach?: string;
  outcome?: string;
  impactMetrics?: WorkMetric[];
  artifacts?: WorkArtifact[];
  tags: string[];
  featured: boolean;
  sortOrder: number;
}

export interface PlaygroundItem {
  slug: string;
  name: string;
  oneLiner: string;
  status: "live" | "wip" | "archived";
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  writeupUrl?: string;
  thumbnail?: string;
  lastUpdated?: string;
}

export interface LinkPreview {
  url: string;
  canonicalUrl?: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
  favicon?: string;
  publishedTime?: string;
}

export interface ContentTag {
  title: string;
  slug: string;
}

export interface HomeLink {
  label: string;
  href: string;
  description?: string;
}

export type PortableTextChild = {
  _type: "span";
  _key?: string;
  text: string;
  marks?: string[];
};

export type PortableTextMarkDef = {
  _key: string;
  _type: string;
  href?: string;
};

export type PortableTextBlock = {
  _type: "block";
  _key?: string;
  style?: string;
  children: PortableTextChild[];
  markDefs?: PortableTextMarkDef[];
};

export type LinkEmbedBlock = {
  _type: "linkEmbed";
  _key?: string;
  url: string;
  displayAs: "card" | "inline";
};

export type YoutubeEmbedBlock = {
  _type: "youtubeEmbed";
  _key?: string;
  url: string;
  title?: string;
};

export type PortableTextBodyBlock =
  | PortableTextBlock
  | LinkEmbedBlock
  | YoutubeEmbedBlock;
export type PortableTextValue = PortableTextBodyBlock[];

export interface Note {
  slug: string;
  kind: "text" | "link";
  title?: string;
  body: PortableTextValue;
  sourceUrl?: string;
  linkPreview?: LinkPreview;
  tags: string[];
  publishedAt: string;
  isPublished: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: PortableTextValue;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  isPublished: boolean;
  readingTimeMinutes: number;
}
