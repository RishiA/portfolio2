interface YoutubeEmbedProps {
  url: string;
  title?: string;
}

interface YoutubeRef {
  id: string;
  kind: "standard" | "shorts";
}

function parseYoutube(url: string): YoutubeRef | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? { id, kind: "standard" } : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? { id, kind: "shorts" } : null;
      }
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? { id, kind: "standard" } : null;
      }
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/")[2];
        return id ? { id, kind: "standard" } : null;
      }
    }
  } catch {
    // fall through
  }
  return null;
}

export function YoutubeEmbed({ url, title }: YoutubeEmbedProps) {
  const ref = parseYoutube(url);

  if (!ref) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="auto-link">
        {url}
      </a>
    );
  }

  const src = `https://www.youtube-nocookie.com/embed/${ref.id}`;
  const wrapperClass = ref.kind === "shorts" ? "youtube-embed youtube-embed-shorts" : "youtube-embed";

  return (
    <div className={wrapperClass}>
      <iframe
        src={src}
        title={title ?? "YouTube video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
