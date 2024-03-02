import { ReactNode } from "react";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { BrowserRouter } from "react-router-dom";

interface PackitBrowserRouterProps {
    children: ReactNode;
}

export const PackitBrowserRouter = ({ children }: PackitBrowserRouterProps) => {
    const authConfig = useAuthConfig();
    return <BrowserRouter basename={authConfig?.appRoute}>{children}</BrowserRouter>;
};
