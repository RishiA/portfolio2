"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { autocomplete, resolveEnter } from "@/lib/terminal/autocomplete";
import { buildRequest, findCommand, localOutput, SUGGESTED_COMMANDS } from "@/lib/terminal/commands";
import { formatResponse, summarize } from "@/lib/terminal/format";
import { CommandHistory } from "@/lib/terminal/history";
import { parseInput } from "@/lib/terminal/parse";
import type { Block } from "@/lib/terminal/types";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import { TerminalBlocks } from "./TerminalOutput";

const REQUEST_TIMEOUT_MS = 8000;
const MAX_ENTRIES = 200;
const PROMPT = "rishi>";

type Entry =
  | { id: number; kind: "welcome" }
  | { id: number; kind: "run"; command: string; loading: boolean; blocks: Block[] };

interface Pending {
  id: number;
  controller: AbortController;
  timedOut: boolean;
}

const errorBlock = (text: string): Block[] => [{ type: "error", text }];

interface TerminalProps {
  /** Called with a /v2/notes/<slug> link when the visitor opens it. */
  onOpenNote?: (href: string) => void;
}

export function Terminal({ onOpenNote }: TerminalProps = {}) {
  const windowFocus = useWindowFocus();
  const inputId = useId();
  const listId = useId();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, kind: "welcome" }]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [slugs, setSlugs] = useState<string[]>([]);
  const [menuDismissed, setMenuDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef(new CommandHistory());
  const idRef = useRef(0);
  const pendingRef = useRef<Pending | null>(null);
  const slugsRequested = useRef(false);

  const suggestions = useMemo(() => autocomplete(input, slugs), [input, slugs]);
  const menuOpen = !menuDismissed && suggestions.length > 0;
  const active = Math.min(activeIndex, Math.max(suggestions.length - 1, 0));

  const addEntry = useCallback((entry: Entry) => {
    setEntries((previous) => [...previous, entry].slice(-MAX_ENTRIES));
  }, []);

  const updateRun = useCallback((id: number, loading: boolean, blocks: Block[]) => {
    setEntries((previous) => previous.map((entry) => (entry.kind === "run" && entry.id === id ? { ...entry, loading, blocks } : entry)));
  }, []);

  const cancelPending = useCallback(
    (announce: boolean) => {
      const pending = pendingRef.current;
      if (!pending) return false;
      pendingRef.current = null;
      pending.controller.abort();
      updateRun(pending.id, false, [{ type: "text", text: "Cancelled." }]);
      if (announce) setStatus("Cancelled");
      return true;
    },
    [updateRun]
  );

  const execute = useCallback(
    async (raw: string) => {
      const command = raw.trim();
      if (!command) return;
      historyRef.current.push(command);
      cancelPending(false);

      const parsed = parseInput(command);
      if (parsed.ok && parsed.name === "clear") {
        setEntries([]);
        setStatus("Cleared");
        return;
      }

      const id = ++idRef.current;
      const finish = (blocks: Block[], announcement: string) => {
        updateRun(id, false, blocks);
        setStatus(announcement);
      };
      addEntry({ id, kind: "run", command, loading: false, blocks: [] });

      const spec = parsed.ok ? findCommand(parsed.name) : undefined;
      if (!parsed.ok || !spec) {
        const message = parsed.ok
          ? `Unknown command: /${parsed.name}. Type /help to see what is available.`
          : "Commands start with /. Type /help to see what is available.";
        finish(errorBlock(message), `Error: ${message}`);
        return;
      }

      if (!spec.api) {
        finish(localOutput(spec.name, window.location.origin) ?? [], "");
        return;
      }

      const request = buildRequest(spec.name, parsed.args);
      if (!request.ok) {
        finish(errorBlock(request.message), `Error: ${request.message}`);
        return;
      }
      if (navigator.onLine === false) {
        const message = "You appear to be offline. Check your connection and try again.";
        finish(errorBlock(message), `Error: ${message}`);
        return;
      }

      const pending: Pending = { id, controller: new AbortController(), timedOut: false };
      pendingRef.current = pending;
      updateRun(id, true, []);
      setStatus("Loading");
      const timer = setTimeout(() => {
        pending.timedOut = true;
        pending.controller.abort();
      }, REQUEST_TIMEOUT_MS);
      const isCurrent = () => pendingRef.current?.id === id;
      const fail = (message: string) => {
        if (!isCurrent()) return;
        pendingRef.current = null;
        finish(errorBlock(message), `Error: ${message}`);
      };

      try {
        const response = await fetch(request.path, { signal: pending.controller.signal });
        let body: unknown = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }
        if (!isCurrent()) return;
        const record = body && typeof body === "object" ? (body as { data?: unknown; error?: { message?: unknown } }) : null;
        if (record?.error && typeof record.error.message === "string") {
          fail(record.error.message);
          return;
        }
        if (!response.ok || !record || !("data" in record)) {
          fail(response.ok ? "Unexpected response from the server." : `Request failed (${response.status}).`);
          return;
        }
        const blocks = formatResponse(spec.name, record.data);
        if (!blocks) {
          fail("Unexpected response from the server.");
          return;
        }
        pendingRef.current = null;
        finish(blocks, summarize(spec.name, blocks));
      } catch (error) {
        if ((error as { name?: string } | null)?.name === "AbortError") {
          if (pending.timedOut) fail("Request timed out. Try again.");
          return;
        }
        if (error instanceof TypeError) {
          fail("Could not reach the server. Check your connection and try again.");
          return;
        }
        fail("Something went wrong. Try again.");
      } finally {
        clearTimeout(timer);
      }
    },
    [addEntry, cancelPending, updateRun]
  );

  // Work slugs come from /api/me/experience, fetched once the first time `/work ` is typed.
  useEffect(() => {
    if (slugsRequested.current || !/^\/work\s/i.test(input)) return;
    slugsRequested.current = true;
    fetch("/api/me/experience")
      .then((response) => response.json())
      .then((body: { data?: Array<{ workSlug?: unknown }> }) => {
        const list = Array.isArray(body.data) ? body.data : [];
        setSlugs(list.map((entry) => entry.workSlug).filter((slug): slug is string => typeof slug === "string"));
      })
      .catch(() => {
        slugsRequested.current = false;
      });
  }, [input]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [entries, menuOpen]);

  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    const history = historyRef.current;
    return () => history.reset();
  }, []);

  const isWindowFocused = windowFocus?.isFocused;
  useEffect(() => {
    if (isWindowFocused) inputRef.current?.focus();
  }, [isWindowFocused]);

  useEffect(
    () => () => {
      pendingRef.current?.controller.abort();
      pendingRef.current = null;
    },
    []
  );

  function changeInput(value: string) {
    setInput(value);
    setMenuDismissed(false);
    setActiveIndex(0);
    historyRef.current.reset();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    let value = input;
    if (menuOpen) {
      const decision = resolveEnter(input, suggestions[active]);
      if (decision.action === "complete") {
        changeInput(decision.value);
        return;
      }
      value = decision.value;
    }
    changeInput("");
    void execute(value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const down = event.key === "ArrowDown";
        if (menuOpen) {
          const count = suggestions.length;
          setActiveIndex((active + (down ? 1 : -1) + count) % count);
          return;
        }
        const value = down ? historyRef.current.next() : historyRef.current.previous(input);
        if (value !== null) {
          setInput(value);
          setMenuDismissed(true);
        }
        return;
      }
      case "Tab":
        if (menuOpen) {
          event.preventDefault();
          changeInput(suggestions[active].value);
        }
        return;
      case "Escape":
        if (menuOpen) {
          event.preventDefault();
          setMenuDismissed(true);
        } else if (cancelPending(true)) {
          event.preventDefault();
        }
        return;
    }
  }

  function onBodyClick(event: React.MouseEvent) {
    if ((event.target as HTMLElement).closest("a, button, code, input")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  }

  function runChip(command: string) {
    changeInput("");
    void execute(command);
    inputRef.current?.focus();
  }

  return (
    <div
      ref={bodyRef}
      data-testid="terminal-body"
      className="h-full w-full cursor-text overflow-y-auto overflow-x-hidden overscroll-contain bg-background px-2 pb-2 pt-2 font-mono text-xs leading-normal text-foreground caret-green-500"
      onClick={onBodyClick}
    >
      {entries.map((entry) =>
        entry.kind === "welcome" ? (
          <section key={entry.id} aria-label="Welcome" className="mb-2 break-words">
            <p>Rishi Athanikar</p>
            <p>Type /help to see what you can do.</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {SUGGESTED_COMMANDS.map((command) => (
                <button
                  key={command}
                  type="button"
                  className="min-h-8 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline max-sm:min-h-11"
                  onClick={() => runChip(command)}
                >
                  {command}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section key={entry.id} aria-label={`Output of ${entry.command}`} className="mb-2 break-words">
            <p className="whitespace-pre-wrap">
              <span>{PROMPT}</span> {entry.command}
            </p>
            {entry.loading ? <p className="text-muted-foreground">Loading...</p> : <TerminalBlocks blocks={entry.blocks} onOpenNote={onOpenNote} />}
          </section>
        )
      )}

      <form onSubmit={submit} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Command
        </label>
        <div className="flex max-w-full items-baseline">
          <span aria-hidden="true" className="whitespace-pre">
            {PROMPT}{" "}
          </span>
          <input
            id={inputId}
            ref={inputRef}
            className="min-w-0 flex-1 border-none bg-transparent text-inherit outline-none max-sm:text-base"
            type="text"
            role="combobox"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={menuOpen ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            value={input}
            onChange={(event) => changeInput(event.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        {menuOpen ? (
          <ul id={listId} role="listbox" aria-label="Command suggestions" className="mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((item, index) => (
              <li
                key={item.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className="flex cursor-pointer flex-wrap gap-x-4 px-1 py-0.5 aria-selected:bg-muted max-sm:py-2"
                onMouseDown={(event) => {
                  event.preventDefault();
                  changeInput(item.value);
                  inputRef.current?.focus();
                }}
              >
                <span>{item.label}</span>
                {item.description ? <span className="text-muted-foreground">{item.description}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </form>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
