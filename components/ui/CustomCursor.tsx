"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const handleHover = () => {
      cursor.classList.add("cursor--active");
    };

    const handleLeave = () => {
      cursor.classList.remove("cursor--active");
    };

    window.addEventListener("mousemove", moveCursor);

    const targets = document.querySelectorAll(
      "a, button, input, textarea, select, .cursor-pointer",
    );

    targets.forEach((el) => {
      el.addEventListener("mouseenter", handleHover);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", handleHover);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden />;
}
