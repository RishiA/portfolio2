export interface ListItem {
  title: string;
  meta?: string;
  detail?: string;
  href?: string;
}

export interface Row {
  key: string;
  value: string;
  href?: string;
}

/** Output model. Every string is rendered as a plain text node, never as HTML. */
export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "list"; items: ListItem[] }
  | { type: "rows"; rows: Row[] }
  | { type: "code"; text: string; copyable?: boolean }
  | { type: "error"; text: string };
