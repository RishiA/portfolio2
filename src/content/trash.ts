// The owner can edit these items. Each one shows up in the Trash window on the /v2 desktop.
export interface TrashItem {
  id: string;
  name: string;
  kind: string;
  /** ISO date the item was "deleted". */
  deletedAt: string;
  note: string;
}

export const TRASH_ITEMS: TrashItem[] = [
  {
    id: "roadmap-final-v7",
    name: "roadmap-final-v7-FINAL.key",
    kind: "Presentation",
    deletedAt: "2026-10-30T16:20:00Z",
    note: "Version 8 is already in review."
  },
  {
    id: "ideas-one-more-meeting",
    name: "ideas-that-needed-one-more-meeting.md",
    kind: "Markdown Document",
    deletedAt: "2026-10-28T14:05:00Z",
    note: "They still need one more meeting."
  },
  {
    id: "priorities-all-of-them",
    name: "q3-priorities-all-of-them.xlsx",
    kind: "Spreadsheet",
    deletedAt: "2026-10-21T09:45:00Z",
    note: "Priority one through priority fourteen."
  },
  {
    id: "quick-sync-notes",
    name: "quick-sync-notes (1).txt",
    kind: "Plain Text",
    deletedAt: "2026-10-14T17:30:00Z",
    note: "The quick sync ran for ninety minutes."
  },
  {
    id: "launch-date-optimistic",
    name: "launch-date-optimistic.png",
    kind: "Image",
    deletedAt: "2026-09-29T11:10:00Z",
    note: "Replaced by a launch date that engineering also believes."
  },
  {
    id: "todo-circle-back",
    name: "TODO-circle-back.docx",
    kind: "Document",
    deletedAt: "2026-09-12T08:55:00Z",
    note: "Circled back. Nothing to report."
  }
];
