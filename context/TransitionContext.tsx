"use client";

import React, { createContext, useContext, useState } from "react";

type TransitionContextType = {
  isTransitioning: boolean;
  startTransition: () => void;
  endTransition: () => void;
};

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  startTransition: () => {},
  endTransition: () => {},
});

export const useTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => setIsTransitioning(true);
  const endTransition = () => setIsTransitioning(false);

  return (
    <TransitionContext.Provider
      value={{ isTransitioning, startTransition, endTransition }}
    >
      {children}
    </TransitionContext.Provider>
  );
};
