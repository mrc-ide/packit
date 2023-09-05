import React from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {NavLink, Outlet, useParams} from "react-router-dom";
import PacketMenu from "./PacketMenu";

export default function Sidebar() {
    const {packetId} = useParams();

    return (
        <>
            <div data-testid="sidebar">
                <div className={`${packetId ? "sidebar-short" : "sidebar"}`}>
                    <ul className="list-unstyled">
                        <li>
                            <NavLink to="/packets">
                                <span className="sidebar-icon"><FindInPage fontSize="small"/></span>
                                <span className="text">Packet explorer</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/run">
                                <span className="sidebar-icon"><Inventory fontSize="small"/></span>
                                <span className="text">Packet runner</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="run-workflow">
                                <span className="sidebar-icon"><Schema fontSize="small"/></span>
                                <span className="text">Workflow runner</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="documentation">
                                <span className="sidebar-icon"><InsertDriveFile fontSize="small"/></span>
                                <span className="text">Project documentation</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                {packetId && <PacketMenu/>}
            </div>
            <Outlet/>
        </>
    );
}
