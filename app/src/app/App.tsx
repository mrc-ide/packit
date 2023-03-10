import React from "react";
import Header from "./components/header/Header";
import active from "../config/active.json";

function App() {
    return (
        <div className={active.instance}>
            <Header/>
            <div className="app">
                <p data-testid={"app-welcome"}>Welcome to packit.</p>
            </div>
        </div>
    );
}

export default App;
