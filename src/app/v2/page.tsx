import { redirect } from "next/navigation";

export default function V2Page(): never {
  redirect("/v2/notes/about-me");
}
