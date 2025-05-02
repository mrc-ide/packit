import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
  showBreadcrumbs: boolean;
  setShowBreadcrumbs: (value: boolean) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);

  return (
    <BreadcrumbContext.Provider value={{ showBreadcrumbs, setShowBreadcrumbs }}>{children}</BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbContext must be used within a BreadcrumbProvider");
  }
  return context;
};
