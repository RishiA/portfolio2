export default function V2NotFound() {
  return (
    <div className="v2-page">
      <h1>Not found</h1>
      <p>This page does not exist.</p>
      <div className="v2-links">
        {/* Plain anchor on purpose: v1 and v2 must load as separate pages. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/v2">Back to v2</a>
        {/* Plain anchor on purpose: v1 and v2 must load as separate pages. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Main site</a>
      </div>
    </div>
  );
}
