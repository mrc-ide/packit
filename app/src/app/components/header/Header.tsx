import React from "react";
import active from "../../../config/active.json";
import HelpIcon from "@mui/icons-material/Help";
import {HeaderDropDown} from "./index";

export default function Header() {
    return (
        <header>
            <nav data-testid="header" className="navbar">
                <a className="navbar-brand" href="/">
                    <img src={active.logo}
                         width="141"
                         height="36"
                         alt="Logo"/></a>
                <div>
                    <span className="px-3">
                        <a className="btn btn-sm rounded"
                           href="#">Accessibility</a>
                    </span>
                    <span className="px-3">
                         <HelpIcon className="icon-primary" sx={{fontSize: 35}}/>
                    </span>
                    <span className="px-3">
                        <HeaderDropDown/>
                    </span>
                </div>
            </nav>
        </header>
    );
}
