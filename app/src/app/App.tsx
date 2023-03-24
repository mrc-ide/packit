import React from "react";
import {Header} from "./components/header";
import active from "../config/active.json";
import {Main} from "./components/main";

export default function App() {
    return (
        <div data-testid="app" className={active.instance}>
            <Header/>
            <div className="app">
                <Main/>
            </div>
        </div>
    );
}
