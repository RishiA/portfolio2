// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { PhotoDetails } from "@/types/content";

export function formatCameraName(details: PhotoDetails): string | undefined {
  if (details.make && details.model) {
    if (details.model.toLowerCase().startsWith(details.make.toLowerCase())) return details.model;
    return `${details.make} ${details.model}`;
  }
  return details.model ?? details.make;
}

export function formatLensDescription(details: PhotoDetails): string | undefined {
  let lensName = details.lensModel;
  if (lensName && details.model) {
    lensName = lensName.replace(new RegExp(`^${escapeRegExp(details.model)}\\s*`, "i"), "");
  }
  lensName = lensName?.replace(/\s+\d+(?:\.\d+)?mm\s+f\/\d+(?:\.\d+)?$/i, "").trim();
  if (lensName) lensName = lensName.charAt(0).toUpperCase() + lensName.slice(1);

  const parts = [
    details.focalLength35mm ? `${Math.round(details.focalLength35mm)} mm` : undefined,
    details.fNumber ? `ƒ${formatDecimal(details.fNumber)}` : undefined
  ].filter(Boolean);

  if (lensName && parts.length > 0) return `${lensName} — ${parts.join(" ")}`;
  return lensName ?? (parts.length > 0 ? parts.join(" ") : undefined);
}

export function formatDimensions(width: number, height: number): string | undefined {
  if (!width || !height) return undefined;
  return `${width} × ${height}`;
}

export function formatMegapixels(width: number, height: number): string | undefined {
  if (!width || !height) return undefined;
  return `${formatDecimal((width * height) / 1_000_000)} MP`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${formatDecimal(bytes / 1_000)} KB`;
  return `${formatDecimal(bytes / 1_000_000)} MB`;
}

export function formatPhotoType(mimeType: string | undefined): string | undefined {
  if (!mimeType) return undefined;
  const subtype = mimeType.toLowerCase().split("/")[1];
  if (!subtype) return undefined;
  return subtype === "jpeg" ? "JPEG" : subtype.toUpperCase();
}

export function formatExposureTime(seconds: number): string {
  if (seconds >= 1) return `${formatDecimal(seconds)} s`;
  if (seconds <= 0) return "—";
  return `1/${Math.round(1 / seconds)} s`;
}

export function formatExposureCompensation(value: number): string {
  const normalized = Math.abs(value) < 0.05 ? 0 : value;
  return `${normalized > 0 ? "+" : ""}${formatDecimal(normalized)} ev`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
