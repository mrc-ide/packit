import React from "react";
import Header from "./components/header/Header";

function App() {
    return (
        <div className="App">
            <Header/>
            <div className="App-main">
                <p data-testid={"app-welcome"}>Welcome to packit.</p>
            </div>
        </div>
    );
}

export default App;
