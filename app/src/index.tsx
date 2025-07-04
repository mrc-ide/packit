import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthConfigProvider } from "@components/providers/AuthConfigProvider";
import { ThemeProvider } from "@components/providers/ThemeProvider";
import { UserProvider } from "@components/providers/UserProvider";
import { RedirectOnLoginProvider } from "@components/providers/RedirectOnLoginProvider";
import { BrandingProvider } from "@components/providers/BrandingProvider";
import reportWebVitals from "./reportWebVitals";
import "./styles/globals.css";
import { Router } from "@components/routes/Router";
import { Toaster } from "@components/Base/Sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrandingProvider>
      <ThemeProvider>
        <AuthConfigProvider>
          <UserProvider>
            <RedirectOnLoginProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Router />
                <Toaster />
              </BrowserRouter>
            </RedirectOnLoginProvider>
          </UserProvider>
        </AuthConfigProvider>
      </ThemeProvider>
    </BrandingProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
