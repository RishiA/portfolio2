import type {
  PortableTextBlock,
  PortableTextChild,
  PortableTextMarkDef,
  PortableTextValue
} from "@/types/content";

const URL_REGEX = /\bhttps?:\/\/[^\s<>"']+/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;

let keyCounter = 0;
function generateKey(): string {
  keyCounter = (keyCounter + 1) % 0xffffff;
  return `al${Date.now().toString(36)}${keyCounter.toString(36)}`;
}

function stripTrailingPunct(url: string): { url: string; trailing: string } {
  const match = url.match(TRAILING_PUNCTUATION);
  if (!match) {
    return { url, trailing: "" };
  }
  return {
    url: url.slice(0, -match[0].length),
    trailing: match[0]
  };
}

function spanHasExistingLink(
  span: PortableTextChild,
  markDefs: PortableTextMarkDef[]
): boolean {
  const marks = span.marks ?? [];
  if (marks.includes("link")) return true;
  return marks.some((markKey) =>
    markDefs.some((def) => def._key === markKey && def._type === "link")
  );
}

function autoLinkBlock(block: PortableTextBlock): PortableTextBlock {
  const markDefs: PortableTextMarkDef[] = [...(block.markDefs ?? [])];
  const nextChildren: PortableTextChild[] = [];

  for (const child of block.children) {
    if (child._type !== "span") {
      nextChildren.push(child);
      continue;
    }

    if (spanHasExistingLink(child, markDefs)) {
      nextChildren.push(child);
      continue;
    }

    const text = child.text;
    const matches = [...text.matchAll(URL_REGEX)];

    if (matches.length === 0) {
      nextChildren.push(child);
      continue;
    }

    let cursor = 0;
    for (const match of matches) {
      const start = match.index ?? 0;
      const raw = match[0];
      const { url, trailing } = stripTrailingPunct(raw);
      const end = start + url.length;

      if (start > cursor) {
        nextChildren.push({
          ...child,
          _key: generateKey(),
          text: text.slice(cursor, start)
        });
      }

      const markKey = generateKey();
      markDefs.push({ _key: markKey, _type: "link", href: url });
      nextChildren.push({
        ...child,
        _key: generateKey(),
        text: url,
        marks: [...(child.marks ?? []), markKey]
      });

      cursor = end;

      if (trailing) {
        nextChildren.push({
          ...child,
          _key: generateKey(),
          text: trailing
        });
        cursor += trailing.length;
      }
    }

    if (cursor < text.length) {
      nextChildren.push({
        ...child,
        _key: generateKey(),
        text: text.slice(cursor)
      });
    }
  }

  return { ...block, markDefs, children: nextChildren };
}

export function autoLinkBody(value: PortableTextValue): PortableTextValue {
  return value.map((block) => {
    if (block._type === "block") {
      return autoLinkBlock(block);
    }
    return block;
  });
}
