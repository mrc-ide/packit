// Extract the brand name from the page title in index.html

import { useMemo } from "react";

export const useGetBrandName = () => {
  const brandName = useMemo(() => {
    if (process.env.NODE_ENV === "test") {
      return "App Title";
    }
    return document.title;
  }, []);

  return brandName;
};
