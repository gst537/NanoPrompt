"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FeatureToggles = {
  enableAblation: boolean;
  enableFileMode: boolean;
  enableDebugMode: boolean;
  enableDashboard: boolean;
};

const defaultFeatures: FeatureToggles = {
  enableAblation: true,
  enableFileMode: true,
  enableDebugMode: true,
  enableDashboard: true,
};

type SettingsContextType = {
  features: FeatureToggles;
  toggleFeature: (key: keyof FeatureToggles) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  features: defaultFeatures,
  toggleFeature: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [features, setFeatures] = useState<FeatureToggles>(defaultFeatures);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nanoprompt_features");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFeatures({ ...defaultFeatures, ...parsed });
      } catch (e) {
        console.error("Failed to parse stored features", e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("nanoprompt_features", JSON.stringify(features));
    }
  }, [features, mounted]);

  const toggleFeature = (key: keyof FeatureToggles) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SettingsContext.Provider value={{ features, toggleFeature }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
