"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error, reset }: ErrorProps) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Could not load blog</h2>
      <p>{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
