import React from "react";
import active from "../../../config/active.json";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Header = () => {
    return (
        <header>
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href="/">
                    <img src={active.logo}
                         width="141"
                         height="36"
                         alt=""/></a>
                <span>
                    <span className="px-3">
                        <a className="btn btn-sm btn-dark rounded"
                           href="#">Accessibility</a>
                    </span>
                    <span className="px-3">
                         <HelpIcon className="icon-primary" sx={{fontSize: 35}}/>
                    </span>
                    <span className="px-3">
                          <AccountCircleIcon className="icon-primary" sx={{fontSize: 35}}/>
                          <ArrowDropDownIcon className="icon-primary"/>
                    </span>
                </span>
            </nav>
        </header>
    );
};
export default Header;
