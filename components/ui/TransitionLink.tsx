"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export default function TransitionLink({
  children,
  href,
  className,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const { startTransition, endTransition } = useTransition();

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    // 1. Evitamos la navegación estándar inmediata
    e.preventDefault();

    // 2. Bajamos el telón
    startTransition();

    // 3. Esperamos EXACTAMENTE lo que dura la animación CSS (800ms)
    // El usuario verá la pantalla negra bajando durante este tiempo.
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 4. Cambiamos la URL (mientras la pantalla sigue negra)
    router.push(href);

    // 5. Esperamos un instante para que Next.js cargue la nueva página
    await new Promise((resolve) => setTimeout(resolve, 400));

    // 6. Levantamos el telón
    endTransition();
  };

  return (
    <Link
      onClick={handleTransition}
      href={href}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
