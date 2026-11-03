"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useRef } from "react";
import { Info, Settings } from "lucide-react";
import { useClickOutside } from "@/lib/v2/use-click-outside";

interface SiteMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAboutThisSite: () => void;
  onSystemSettings: () => void;
}

export function SiteMenu({ isOpen, onClose, onAboutThisSite, onSystemSettings }: SiteMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-7 left-2 w-64 rounded-lg bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl shadow-2xl border border-black/10 dark:border-white/10 py-1 z-[70] overflow-hidden"
    >
      <MenuItem
        icon={<Info className="w-4 h-4" />}
        label="About This Site"
        onClick={() => {
          onAboutThisSite();
          onClose();
        }}
      />

      <MenuDivider />

      <MenuItem
        icon={<Settings className="w-4 h-4" />}
        label="System Settings…"
        onClick={() => {
          onSystemSettings();
          onClose();
        }}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-left hover:bg-blue-500 hover:text-white transition-colors group"
    >
      <span className="text-muted-foreground group-hover:text-white">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 border-t border-black/10 dark:border-white/10" />;
}
