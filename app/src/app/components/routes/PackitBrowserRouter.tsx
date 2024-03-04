import { ReactNode } from "react";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { BrowserRouter } from "react-router-dom";

interface PackitBrowserRouterProps {
    children: ReactNode;
}

export const PackitBrowserRouter = ({ children }: PackitBrowserRouterProps) => {
    const authConfig = useAuthConfig();
    // Support Montagu by optionally providing a route under the domain which all react router links are relative to
    return <BrowserRouter basename={authConfig?.appRoute}>{children}</BrowserRouter>;
};
