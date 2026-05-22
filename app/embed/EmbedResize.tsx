"use client";

import { useEffect } from "react";

/**
 * Sends height changes to the parent window via postMessage so the host
 * iframe can resize itself. The host page can listen with:
 *
 *   window.addEventListener('message', (e) => {
 *     if (e.data?.type === 'boken-resize' && typeof e.data.height === 'number') {
 *       iframe.style.height = e.data.height + 'px';
 *     }
 *   });
 */
export function EmbedResize() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let last = 0;
    const send = () => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - last) < 4) return;
      last = h;
      window.parent?.postMessage({ type: "boken-resize", height: h }, "*");
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    const interval = setInterval(send, 1000);
    return () => {
      ro.disconnect();
      clearInterval(interval);
    };
  }, []);
  return null;
}
