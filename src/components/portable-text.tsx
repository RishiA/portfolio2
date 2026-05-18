import { PortableText } from "@portabletext/react";
import { LinkEmbed } from "@/components/link-embed";
import { YoutubeEmbed } from "@/components/youtube-embed";
import type { PortableTextValue } from "@/types/content";

interface PortableTextRendererProps {
  value: PortableTextValue;
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <PortableText
      value={value}
      components={{
        block: {
          normal: ({ children }) => <p>{children}</p>
        },
        marks: {
          link: ({ value, children }) => {
            const href = value?.href as string | undefined;
            if (!href) return <>{children}</>;
            const external = /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                className="auto-link"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          }
        },
        types: {
          linkEmbed: ({ value }) => {
            if (!value?.url) return null;
            const displayAs = value.displayAs === "inline" ? "inline" : "card";
            return <LinkEmbed url={value.url} displayAs={displayAs} />;
          },
          youtubeEmbed: ({ value }) => {
            if (!value?.url) return null;
            return <YoutubeEmbed url={value.url} title={value.title} />;
          }
        }
      }}
    />
  );
}
