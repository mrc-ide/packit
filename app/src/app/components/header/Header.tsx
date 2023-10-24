import React from "react";
import active from "../../../config/active.json";
import HelpIcon from "@mui/icons-material/Help";
import {HeaderDropDown} from "./index";
import { NavLink } from "react-router-dom";

export default function Header() {
    return (
        <header>
            <nav data-testid="header" className="navbar">
                <NavLink to="/" className="navbar-brand">
                    <img src={`/img/${active.logo}`}
                         width="141"
                         height="36"
                         alt="Logo"/>
                </NavLink>
                <div>
                    <span className="px-3">
                        <NavLink to="#" className="btn btn-sm rounded">
                            Accessibility
                        </NavLink>
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
