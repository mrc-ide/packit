import React from "react";
import Header from "./components/header/Header";
import active from "../config/active.json";
import Main from "./components/main/Main";

function App() {
    return (
        <div data-testid="main" className={active.instance}>
            <Header/>
            <div className="app">
                <Main/>
            </div>
        </div>
    );
}

export default App;
