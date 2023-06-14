import React from "react";
import {Router} from "../Routes/Router";

export default function Main() {
    return (
        <main data-testid="main">
            <div data-testid="content">
                <Router/>
            </div>
        </main>
    );
}
