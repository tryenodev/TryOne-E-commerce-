'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sortOrder: number;
};

export type StoreMenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  location: string;
};

type StoreConfigContextType = {
  categories: StoreCategory[];
  menuItems: StoreMenuItem[];
  loading: boolean;
  refresh: () => void;
};

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/store/menu').then((r) => r.json()),
    ])
      .then(([catData, menuData]) => {
        setCategories(catData.categories ?? []);
        setMenuItems(menuData.items ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <StoreConfigContext.Provider value={{ categories, menuItems, loading, refresh: load }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) {
    throw new Error('useStoreConfig must be used within StoreConfigProvider');
  }
  return ctx;
}
