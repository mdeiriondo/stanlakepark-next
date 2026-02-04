"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Solo en desktop
    if (window.innerWidth < 768) return;

    let isMoving = false;

    const updateCursorPosition = () => {
      if (cursor && isMoving) {
        cursor.style.transform = `translate3d(${mousePosition.current.x}px, ${mousePosition.current.y}px, 0)`;
        rafId.current = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        setIsVisible(true);
      }

      mousePosition.current = { x: e.clientX, y: e.clientY };

      if (!isMoving) {
        isMoving = true;
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        rafId.current = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseEnter = () => {
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    // Usar event delegation para detectar elementos interactivos
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      const isClickable =
        tagName === "a" ||
        tagName === "button" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.classList.contains("cursor-pointer");

      if (isClickable) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isVisible]);

  return (
    <>
      {/* Cursor personalizado */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isActive ? "cursor--active" : ""}`}
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      />
    </>
  );
}
