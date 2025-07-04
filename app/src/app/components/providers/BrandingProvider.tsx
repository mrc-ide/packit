import { createContext, useContext, ReactNode } from "react";
import { BrandingConfiguration } from "@/types";
import { useGetBrandingConfig } from "./hooks/useGetBrandingConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";

interface BrandingContextType {
  brandingConfig: BrandingConfiguration | undefined;
  brandName: string;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { brandingConfig, error } = useGetBrandingConfig();

  if (error) return <ErrorComponent message={error.message} error={error} />;

  return (
    <BrandingContext.Provider value={{ brandingConfig, brandName: document.title }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBrandingContext = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBrandingContext must be used within a BrandingProvider");
  }
  return context;
};
