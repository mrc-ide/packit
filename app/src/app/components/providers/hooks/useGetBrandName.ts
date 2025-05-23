// Extract the brand name from the page title in index.html

import { useMemo } from "react";

export const useGetBrandName = () => {
  const brandName = useMemo(() => {
    return document.title;
  }, []);

  return brandName;
};
