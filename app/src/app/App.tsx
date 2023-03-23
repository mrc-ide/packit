import React from "react";
import Header from "./components/header/Header";
import active from "../config/active.json";

function App() {
    return (
        <div data-testid="main" className={active.instance}>
            <Header/>
            <div className="app">
                <p>Welcome to packit.</p>
            </div>
        </div>
    );
}

export default App;
