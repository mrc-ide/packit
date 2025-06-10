import { createContext, useContext, ReactNode } from "react";
import { LogoConfiguration } from "../../../types";
import { useGetLogoConfig } from "./hooks/useGetLogoConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";

interface BrandingContextType {
  logoConfig: LogoConfiguration | undefined;
  brandName: string;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { logoConfig, error } = useGetLogoConfig();

  if (error) return <ErrorComponent message={error.message} error={error} />;

  return (
    <BrandingContext.Provider value={{ logoConfig, brandName: document.title }}>{children}</BrandingContext.Provider>
  );
};

export const useBrandingContext = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBrandingContext must be used within a BrandingProvider");
  }
  return context;
};
