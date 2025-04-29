import { Header } from "./components/header";
import { Main } from "./components/main";
import { useEffect } from "react";
import { useGetBranding } from "./components/contents/common/hooks/useGetBranding";

export const App = () => {
  const { brandConfig } = useGetBranding();

  useEffect(() => {
    console.log(brandConfig?.brandName)
    if (brandConfig?.brandName) {
      document.title = brandConfig?.brandName;
    }
  }, [brandConfig?.brandName]);

  return (
    <div data-testid="app">
      <Header />
      <div className="app">
        <Main />
      </div>
    </div>
  );
};
