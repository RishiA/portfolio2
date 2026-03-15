"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ error, reset }: ErrorProps) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Something went wrong</h2>
      <p>{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
