"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useState } from "react";
import { FileText, Image as ImageIcon, Presentation, Sheet, Trash2, type LucideIcon } from "lucide-react";
import type { V2AppProps } from "@/components/v2/apps/types";
import { WindowControls } from "@/components/v2/desktop/window-controls";
import { WindowNavShell } from "@/components/v2/desktop/window-nav-shell";
import { TRASH_ITEMS, type TrashItem } from "@/content/trash";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";
import { cn } from "@/lib/v2/utils";

const KIND_ICONS: Record<string, LucideIcon> = {
  Presentation,
  Spreadsheet: Sheet,
  Image: ImageIcon
};

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function ItemIcon({ kind, selected }: { kind: string; selected: boolean }) {
  const Icon = KIND_ICONS[kind] ?? FileText;
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
        selected ? "bg-white/20 text-white" : "bg-muted-foreground/15 text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default function TrashApp({ isMobile = false }: V2AppProps) {
  const nav = useWindowNavBehavior({ isDesktop: !isMobile, isMobile });
  const [items, setItems] = useState<TrashItem[]>(TRASH_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingEmpty, setConfirmingEmpty] = useState(false);

  const selected = items.find((item) => item.id === selectedId);
  const count = items.length;

  const emptyTrash = () => {
    setItems([]);
    setSelectedId(null);
    setConfirmingEmpty(false);
  };

  return (
    <div className="flex h-full flex-col bg-background" data-testid="app-window-trash">
      <WindowNavShell
        isMobile={isMobile}
        onMouseDown={nav.onDragStart}
        left={
          <WindowControls
            inShell={nav.inShell}
            showWhenNotInShell={false}
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
            closeLabel={nav.closeLabel}
          />
        }
        center={
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            Trash
          </div>
        }
        right={
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setConfirmingEmpty(true)}
            disabled={count === 0 || confirmingEmpty}
            className="rounded-md bg-background px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-border can-hover:hover:bg-background/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Empty
          </button>
        }
      />

      {confirmingEmpty && (
        <div role="alertdialog" aria-labelledby="empty-trash-title" className="flex items-center justify-between gap-4 border-b border-border bg-muted/60 px-4 py-3 text-sm">
          <div>
            <p id="empty-trash-title" className="font-medium">
              Empty the Trash?
            </p>
            <p className="text-xs text-muted-foreground">
              These files are gone for good. The meetings they came from are not.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setConfirmingEmpty(false)}
              className="rounded-md bg-background px-3 py-1 text-xs font-medium ring-1 ring-border can-hover:hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={emptyTrash}
              className="rounded-md bg-[#0A7CFF] px-3 py-1 text-xs font-medium text-white can-hover:hover:bg-[#006EE6]"
            >
              Empty Trash
            </button>
          </div>
        </div>
      )}

      {count > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col text-xs" role="table" aria-label="Trash">
          <div role="row" className="grid grid-cols-[minmax(0,1fr)_120px_140px] border-b border-border px-4 py-1.5 text-muted-foreground">
            <span role="columnheader">Name</span>
            <span role="columnheader">Date Deleted</span>
            <span role="columnheader">Kind</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto" onClick={() => setSelectedId(null)}>
            {items.map((item, index) => (
              <div
                key={item.id}
                role="row"
                tabIndex={0}
                aria-selected={item.id === selectedId}
                data-testid="trash-item"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(item.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(item.id);
                  }
                }}
                className={cn(
                  "grid cursor-default grid-cols-[minmax(0,1fr)_120px_140px] items-center px-4 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A7CFF]",
                  item.id === selectedId ? "bg-[#0A7CFF] text-white" : index % 2 === 1 && "bg-muted/60"
                )}
              >
                <span role="cell" className="flex min-w-0 items-center gap-2">
                  <ItemIcon kind={item.kind} selected={item.id === selectedId} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span role="cell" className={cn(item.id !== selectedId && "text-muted-foreground")}>
                  {dateFormat.format(new Date(item.deletedAt))}
                </span>
                <span role="cell" className={cn("truncate", item.id !== selectedId && "text-muted-foreground")}>
                  {item.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center" data-testid="trash-empty">
          <Trash2 className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-medium">Trash is empty</p>
          <p className="text-xs text-muted-foreground">Nothing left to circle back on.</p>
          <button
            type="button"
            onClick={() => setItems(TRASH_ITEMS)}
            className="mt-2 rounded-md bg-muted px-3 py-1 text-xs font-medium can-hover:hover:bg-muted/70"
          >
            Put everything back
          </button>
        </div>
      )}

      <div className="border-t border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground" aria-live="polite" data-testid="trash-status">
        {selected ? selected.note : `${count} ${count === 1 ? "item" : "items"}`}
      </div>
    </div>
  );
}
