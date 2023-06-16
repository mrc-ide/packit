import React from "react";
import {Router} from "../routes/Router";

export default function Main() {
    return (
        <main data-testid="main">
            <div data-testid="content">
                <Router/>
            </div>
        </main>
    );
}
