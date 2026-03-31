import { useEffect, useRef } from "react";

interface PageEmbedProps {
  src: string;
  title: string;
}

export default function PageEmbed({ src, title }: PageEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Hide the prototype's own header bar since our sidebar replaces it
        const header = doc.querySelector(".page-header");
        if (header) (header as HTMLElement).style.display = "none";

        // Adjust body top margin since header is hidden
        const body = doc.body;
        if (body) {
          body.style.paddingTop = "0";
        }

        // Remove sticky top from hero/tab sections since no header
        const hero = doc.querySelector(".page-hero") as HTMLElement;
        if (hero) hero.style.paddingTop = "16px";

        // Auto-resize iframe to content height
        const resizeObserver = new ResizeObserver(() => {
          if (doc.body) {
            iframe.style.height = doc.body.scrollHeight + "px";
          }
        });
        resizeObserver.observe(doc.body);

        return () => resizeObserver.disconnect();
      } catch {
        // Cross-origin safety — won't happen for same-origin files
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      style={{
        width: "100%",
        minHeight: "calc(100vh - 60px)",
        border: "none",
        display: "block",
      }}
    />
  );
}
