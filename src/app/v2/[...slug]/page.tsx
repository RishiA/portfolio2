import { notFound } from "next/navigation";

// Unknown /v2 URLs render the v2 404 instead of the v1 root 404.
export default function V2CatchAll() {
  notFound();
}
