import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthConfigProvider } from "./app/components/providers/AuthConfigProvider";
import { ThemeProvider } from "./app/components/providers/ThemeProvider";
import { UserProvider } from "./app/components/providers/UserProvider";
import { RedirectOnLoginProvider } from "./app/components/providers/RedirectOnLoginProvider";
import reportWebVitals from "./reportWebVitals";
import "./styles/globals.css";
import { Router } from "./app/components/routes/Router";
import { BreadcrumbProvider } from "./app/components/providers/BreadcrumbProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BreadcrumbProvider>
      <ThemeProvider>
        <AuthConfigProvider>
          <UserProvider>
            <RedirectOnLoginProvider>
              <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Router />
              </BrowserRouter>
            </RedirectOnLoginProvider>
          </UserProvider>
        </AuthConfigProvider>
      </ThemeProvider>
    </BreadcrumbProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
