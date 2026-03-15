import { PortableText } from "@portabletext/react";
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
        }
      }}
    />
  );
}
