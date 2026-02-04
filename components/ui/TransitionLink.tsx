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
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const { startTransition, endTransition } = useTransition();

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();

    // 1. Iniciar la cortina
    startTransition();

    // 2. Esperar a que la cortina cubra la pantalla (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Navegar de verdad
    router.push(href);

    // 4. Esperar un poco y levantar la cortina en la nueva página
    await new Promise((resolve) => setTimeout(resolve, 500));
    endTransition();
  };

  return (
    <Link onClick={handleTransition} href={href} {...props}>
      {children}
    </Link>
  );
}
