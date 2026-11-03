"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { autocomplete, resolveEnter } from "@/lib/terminal/autocomplete";
import { buildRequest, findCommand, localOutput, SUGGESTED_COMMANDS } from "@/lib/terminal/commands";
import { formatResponse, summarize } from "@/lib/terminal/format";
import { CommandHistory } from "@/lib/terminal/history";
import { parseInput } from "@/lib/terminal/parse";
import type { Block } from "@/lib/terminal/types";
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

export function Terminal() {
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
  }, [entries]);

  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    const history = historyRef.current;
    return () => history.reset();
  }, []);

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
    <div className="v2-terminal">
      <div className="v2t-body" ref={bodyRef} onClick={onBodyClick}>
        <div className="v2t-inner">
          {entries.map((entry) =>
            entry.kind === "welcome" ? (
              <section key={entry.id} className="v2t-entry" aria-label="Welcome">
                <p className="v2t-heading">Rishi Athanikar</p>
                <p className="v2t-text">Type a command or pick one below.</p>
                <div className="v2t-chips">
                  {SUGGESTED_COMMANDS.map((command) => (
                    <button key={command} type="button" className="v2t-chip" onClick={() => runChip(command)}>
                      {command}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section key={entry.id} className="v2t-entry" aria-label={`Output of ${entry.command}`}>
                <p className="v2t-echo">
                  <span className="v2t-prompt">{PROMPT}</span> {entry.command}
                </p>
                {entry.loading ? <p className="v2t-muted">Loading...</p> : <TerminalBlocks blocks={entry.blocks} />}
              </section>
            )
          )}
        </div>
      </div>

      <form className="v2t-form" onSubmit={submit}>
        {menuOpen ? (
          <ul id={listId} role="listbox" aria-label="Command suggestions" className="v2t-menu">
            {suggestions.map((item, index) => (
              <li
                key={item.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className="v2t-option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  changeInput(item.value);
                  inputRef.current?.focus();
                }}
              >
                <span>{item.label}</span>
                {item.description ? <span className="v2t-meta">{item.description}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <label htmlFor={inputId} className="v2t-sr">
          Command
        </label>
        <div className="v2t-inputrow">
          <span className="v2t-prompt" aria-hidden="true">
            {PROMPT}
          </span>
          <input
            id={inputId}
            ref={inputRef}
            className="v2t-input"
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
            placeholder="/help"
            value={input}
            onChange={(event) => changeInput(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="submit" className="v2t-run">
            Run
          </button>
        </div>
      </form>
      <p className="v2t-sr" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
