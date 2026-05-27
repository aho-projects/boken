"use client";

import { useEffect } from "react";

/**
 * Sends content-height changes to the parent window via postMessage so the
 * host iframe can size itself to fit.
 *
 * Important: we measure the ACTUAL content height (the bottom of the last
 * rendered element inside <main>), NOT document.documentElement.scrollHeight.
 * Using documentElement would grow when the iframe outer height grows, which
 * causes an infinite resize feedback loop with parent listeners that pad
 * the height (e.g. `iframe.height = msg.height + 4`).
 */
export function EmbedResize() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastSent = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const measure = (): number => {
      const main = document.querySelector("main") || document.body;
      const lastChild = main.lastElementChild as HTMLElement | null;
      const bodyStyle = getComputedStyle(document.body);
      const padBottom = parseFloat(bodyStyle.paddingBottom || "0");
      if (lastChild) {
        const rect = lastChild.getBoundingClientRect();
        // rect.bottom is relative to viewport top, which inside an iframe
        // == the iframe's own top. Add bottom padding/margin of body.
        return Math.ceil(rect.bottom + padBottom + 8);
      }
      return Math.ceil(main.getBoundingClientRect().height + padBottom + 8);
    };

    const send = () => {
      const h = measure();
      // Stable threshold: only send if real content changed by more than
      // any sensible parent padding (>= 16px difference).
      if (Math.abs(h - lastSent) < 16) return;
      lastSent = h;
      window.parent?.postMessage({ type: "boken-resize", height: h }, "*");
    };

    const scheduledSend = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(send, 80);
    };

    // Initial measure (after layout settles)
    requestAnimationFrame(() => {
      requestAnimationFrame(send);
    });

    // Body resizes (forms toggle, files added, etc.)
    const ro = new ResizeObserver(scheduledSend);
    ro.observe(document.body);

    // Async images can grow the content after initial paint
    const imgs = document.body.querySelectorAll<HTMLImageElement>("img");
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", scheduledSend, { once: true });
    });

    // Safety net: re-measure occasionally in case something async changes
    const interval = setInterval(send, 3000);

    return () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return null;
}
