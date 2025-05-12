import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { LogoConfiguration } from "../../../types";
import { useGetLogoConfig } from "./hooks/useGetLogoConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetBrandName } from "./hooks/useGetBrandName";

interface BrandingContextType {
  logoConfig: LogoConfiguration | undefined;
  logoConfigIsLoaded: boolean;
  brandName: string;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [logoConfigIsLoaded, setLogoConfigLoaded] = useState<boolean>(false);

  const { logoConfig, error } = useGetLogoConfig();

  useEffect(() => setLogoConfigLoaded(!!logoConfig), [logoConfig]);

  if (error) return <ErrorComponent message={error.message} error={error} />;

  const brandName = useGetBrandName();

  return (
    <BrandingContext.Provider value={{ logoConfig, logoConfigIsLoaded, brandName }}>
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
