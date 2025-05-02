import { Outlet } from "react-router-dom";
import { useBreadcrumbContext } from "../providers/BreadcrumbProvider";
import { useEffect } from "react";

export const BreadcrumbRoute = () => {
  const { setShowBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    // Set showBreadcrumbs to true when the component mounts
    setShowBreadcrumbs(true);

    // Cleanup function to set showBreadcrumbs to false when the component unmounts
    return () => {
      setShowBreadcrumbs(false);
    };
  }, [setShowBreadcrumbs]);

  return <Outlet />;
};
