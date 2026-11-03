export default function V2Page() {
  return (
    <div className="v2-page">
      <h1>v2 in progress</h1>
      <p>This section is not ready yet.</p>
      <p>
        {/* Plain anchor on purpose: v1 and v2 must load as separate pages. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Back to the main site</a>
      </p>
    </div>
  );
}
