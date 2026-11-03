import { useId } from "react";
import type { JSX, ReactNode, SVGProps } from "react";

export type V2AppId = "notes" | "terminal" | "photos" | "music" | "settings";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

/** Stable, selector-safe id prefix, unique per component instance. */
function useUid(name: string): string {
  return `v2-${name}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/**
 * Shared squircle tile: soft drop shadow, vertical gradient, inner highlight rim.
 * Children are drawn on top, inside the 100x100 viewBox.
 */
function Tile({
  uid,
  top,
  bottom,
  children,
}: {
  uid: string;
  top: string;
  bottom: string;
  children: ReactNode;
}) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-sh`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#000" floodOpacity="0.38" />
        </filter>
        <clipPath id={`${uid}-clip`}>
          <rect x="6" y="4" width="88" height="88" rx="21" />
        </clipPath>
      </defs>
      <rect x="6" y="4" width="88" height="88" rx="21" fill={`url(#${uid}-bg)`} filter={`url(#${uid}-sh)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="6" y="4" width="88" height="44" fill={`url(#${uid}-gloss)`} />
        {children}
      </g>
      <rect
        x="6.5"
        y="4.5"
        width="87"
        height="87"
        rx="20.5"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="1"
      />
    </>
  );
}

export function NotesIcon({ title, ...props }: IconProps) {
  const uid = useUid("notes");
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Notes"} {...props}>
      <Tile uid={uid} top="#ffd86b" bottom="#f2a431">
        <defs>
          <filter id={`${uid}-card`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#7a3f00" floodOpacity="0.35" />
          </filter>
          <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf4" />
            <stop offset="1" stopColor="#f7eed4" />
          </linearGradient>
          <linearGradient id={`${uid}-pen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a5568" />
            <stop offset="0.5" stopColor="#6b7a90" />
            <stop offset="1" stopColor="#3c4658" />
          </linearGradient>
        </defs>
        {/* index card */}
        <g transform="rotate(-6 46 48)" filter={`url(#${uid}-card)`}>
          <rect x="18" y="24" width="56" height="42" rx="4" fill={`url(#${uid}-paper)`} />
          <path d="M18 34h56" stroke="#e5564b" strokeWidth="1.6" />
          <path d="M24 42h40M24 48.5h40M24 55h26" stroke="#8fb3d9" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        {/* pencil */}
        <g transform="rotate(38 66 62)">
          <rect x="62" y="30" width="9" height="40" rx="1.6" fill="#ff7a59" />
          <rect x="62" y="30" width="3.2" height="40" fill="#ffffff" opacity="0.28" />
          <rect x="62" y="26" width="9" height="6" rx="1.6" fill={`url(#${uid}-pen)`} />
          <rect x="62" y="22" width="9" height="5" rx="2.4" fill="#f3a6b8" />
          <path d="M62 70h9l-4.5 11z" fill="#f4dcb3" />
          <path d="M64.4 75.5h4.2l-2.1 5.5z" fill="#3a3a3a" />
        </g>
      </Tile>
    </svg>
  );
}

export function TerminalIcon({ title, ...props }: IconProps) {
  const uid = useUid("terminal");
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Terminal"} {...props}>
      <Tile uid={uid} top="#383d46" bottom="#101216">
        <defs>
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g fill="#fff" opacity="0.28">
          <circle cx="20" cy="17" r="2" />
          <circle cx="27" cy="17" r="2" />
          <circle cx="34" cy="17" r="2" />
        </g>
        <g filter={`url(#${uid}-glow)`} stroke="#5cf0a2" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M25 40l17 12-17 12" />
          <path d="M50 68h24" />
        </g>
      </Tile>
    </svg>
  );
}

export function PhotosIcon({ title, ...props }: IconProps) {
  const uid = useUid("photos");
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Photos"} {...props}>
      <Tile uid={uid} top="#ff8f6b" bottom="#d9437a">
        <defs>
          <filter id={`${uid}-pol`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#4a0a2a" floodOpacity="0.4" />
          </filter>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fc3ee" />
            <stop offset="1" stopColor="#c7ecfa" />
          </linearGradient>
          <clipPath id={`${uid}-pic`}>
            <rect x="29" y="31" width="42" height="34" rx="1.5" />
          </clipPath>
        </defs>
        {/* back polaroid */}
        <g transform="rotate(11 54 50)" filter={`url(#${uid}-pol)`}>
          <rect x="30" y="20" width="46" height="56" rx="3" fill="#f6f1ec" />
          <rect x="34" y="24" width="38" height="34" rx="1.5" fill="#2f3a8f" />
          <circle cx="53" cy="41" r="8" fill="none" stroke="#9aa6ff" strokeWidth="1.6" opacity="0.7" />
        </g>
        {/* front polaroid */}
        <g transform="rotate(-7 50 52)" filter={`url(#${uid}-pol)`}>
          <rect x="25" y="26" width="50" height="58" rx="3" fill="#fffdfb" />
          <rect x="29" y="31" width="42" height="34" rx="1.5" fill={`url(#${uid}-sky)`} />
          <g clipPath={`url(#${uid}-pic)`}>
            <circle cx="58" cy="40" r="4.6" fill="#ffd34d" />
            <path d="M29 65V54l10-10 8 9 6-5 18 13v4z" fill="#3f9d6b" />
            <path d="M29 65V58l9-6 9 7 8-4 16 10v0z" fill="#2c7a52" />
            <path d="M29 65V60l12-3 12 3 18-2v7z" fill="#256a47" />
          </g>
        </g>
      </Tile>
    </svg>
  );
}

export function MusicIcon({ title, ...props }: IconProps) {
  const uid = useUid("music");
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Music"} {...props}>
      <Tile uid={uid} top="#7a5cff" bottom="#2b1b86">
        <defs>
          <radialGradient id={`${uid}-disc`} cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#3a3a46" />
            <stop offset="1" stopColor="#0c0c12" />
          </radialGradient>
          <linearGradient id={`${uid}-label`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb347" />
            <stop offset="1" stopColor="#ff5e62" />
          </linearGradient>
          <filter id={`${uid}-dsh`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#10003a" floodOpacity="0.55" />
          </filter>
        </defs>
        <g filter={`url(#${uid}-dsh)`}>
          <circle cx="50" cy="50" r="32" fill={`url(#${uid}-disc)`} />
        </g>
        <g fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1">
          <circle cx="50" cy="50" r="29" />
          <circle cx="50" cy="50" r="25.5" />
          <circle cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="19" />
        </g>
        {/* sheen */}
        <path d="M50 50L76 28A32 32 0 0 1 82 50z" fill="#fff" opacity="0.07" />
        <path d="M50 50L24 72A32 32 0 0 1 18 50z" fill="#fff" opacity="0.07" />
        <circle cx="50" cy="50" r="12" fill={`url(#${uid}-label)`} />
        <circle cx="50" cy="50" r="12" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="2.4" fill="#1b1030" />
        {/* tonearm */}
        <g>
          <circle cx="82" cy="20" r="5" fill="#d9dbe6" />
          <circle cx="82" cy="20" r="2" fill="#6a6f85" />
          <path d="M82 20L74 56" stroke="#eceef7" strokeWidth="3" strokeLinecap="round" />
          <rect x="70" y="54" width="8" height="12" rx="2" transform="rotate(14 74 60)" fill="#eceef7" />
        </g>
      </Tile>
    </svg>
  );
}

export function SettingsIcon({ title, ...props }: IconProps) {
  const uid = useUid("settings");
  const rows = [
    { y: 30, knob: 38, fillTo: 38, color: "#ff9f43" },
    { y: 50, knob: 64, fillTo: 64, color: "#34c7a0" },
    { y: 70, knob: 48, fillTo: 48, color: "#6c8cff" },
  ];
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Settings"} {...props}>
      <Tile uid={uid} top="#9aa9c2" bottom="#4f5f7c">
        <defs>
          <filter id={`${uid}-k`} x="-50%" y="-50%" width="200%" height="220%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#10182a" floodOpacity="0.45" />
          </filter>
          <linearGradient id={`${uid}-knob`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe4ee" />
          </linearGradient>
        </defs>
        {rows.map((r) => (
          <g key={r.y}>
            <rect x="20" y={r.y - 3.5} width="60" height="7" rx="3.5" fill="#1b2438" opacity="0.38" />
            <rect x="20" y={r.y - 3.5} width={r.fillTo - 20} height="7" rx="3.5" fill={r.color} />
            <circle cx={r.knob} cy={r.y} r="8" fill={`url(#${uid}-knob)`} filter={`url(#${uid}-k)`} />
          </g>
        ))}
      </Tile>
    </svg>
  );
}

export function TrashIcon({ title, ...props }: IconProps) {
  const uid = useUid("trash");
  const body = "M21 28H79L74.5 85Q74 91 68 91H32Q26 91 25.5 85Z";
  const lines: string[] = [];
  for (let i = -60; i <= 100; i += 9) {
    lines.push(`M${i} 20L${i + 60} 95`);
    lines.push(`M${i + 60} 20L${i} 95`);
  }
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Trash"} {...props}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8edf5" stopOpacity="0.5" />
          <stop offset="1" stopColor="#aab4c6" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f7fb" />
          <stop offset="1" stopColor="#aeb8ca" />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.22" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={body} />
        </clipPath>
        <filter id={`${uid}-sh`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter={`url(#${uid}-sh)`}>
        <path d={body} fill={`url(#${uid}-body)`} />
        <g clipPath={`url(#${uid}-clip)`}>
          <path d={lines.join("")} stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" fill="none" />
          <path d={body} fill={`url(#${uid}-side)`} />
        </g>
        <path d={body} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="16" y="19" width="68" height="11" rx="5.5" fill={`url(#${uid}-rim)`} />
        <rect x="18" y="20.5" width="64" height="3" rx="1.5" fill="#fff" opacity="0.6" />
        <rect x="16" y="19" width="68" height="11" rx="5.5" fill="none" stroke="#7d8799" strokeOpacity="0.5" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Small mark shown at the far left of the menu bar, in place of a vendor logo. */
export function BrandMark({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" role="img" aria-label={title ?? "Rishi"} {...props}>
      <path
        d="M4.6 12.6V4.4M4.6 8.1C4.6 5.9 6.2 4.6 8.2 4.6c1 0 1.7.2 2.3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.9" cy="11.9" r="1.35" fill="currentColor" />
    </svg>
  );
}

export const APP_ICONS: Record<V2AppId, (props: IconProps) => JSX.Element> = {
  notes: NotesIcon,
  terminal: TerminalIcon,
  photos: PhotosIcon,
  music: MusicIcon,
  settings: SettingsIcon
};
