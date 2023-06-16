import React from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {NavLink, Outlet} from "react-router-dom";

export default function Sidebar() {

    return (
        <>
            <div data-testid="sidebar" className="sidebar">
                <ul className="list-unstyled">
                    <li>
                        <NavLink to="/">
                            <span className="sidebar-icon"><FindInPage fontSize="small"/></span>
                            <span>Packet explorer</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/run">
                            <span className="sidebar-icon"><Inventory fontSize="small"/></span>
                            <span>Packet runner</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="run-workflow">
                            <span className="sidebar-icon"><Schema fontSize="small"/></span>
                            <span>Workflow runner</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="documentation">
                            <span className="sidebar-icon"><InsertDriveFile fontSize="small"/></span>
                            <span>Project documentation</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
            <Outlet/>
        </>
    );
}
