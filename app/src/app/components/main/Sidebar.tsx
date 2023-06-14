import React, {useState} from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {SideBarItems} from "../../../types";
import {Link, Outlet} from "react-router-dom";

export default function Sidebar() {
    const [selected, setSelected] = useState(SideBarItems.explorer);

    return (
        <>
            <div data-testid="sidebar" className="sidebar">
                <ul className="list-unstyled">
                    <li>
                        <Link to="/"
                              className={selected === SideBarItems.explorer ? "active" : ""}
                              onClick={() => setSelected(SideBarItems.explorer)}>
                            <span className="sidebar-icon"><FindInPage fontSize="small"/></span>
                            <span>Packet explorer</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/run"
                              className={selected === SideBarItems.packetRunner ? "active" : ""}
                              onClick={() => setSelected(SideBarItems.packetRunner)}>
                            <span className="sidebar-icon"><Inventory fontSize="small"/></span>
                            <span>Packet runner</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="run-workflow"
                              className={selected === SideBarItems.workflowRunner ? "active" : ""}
                              onClick={() => setSelected(SideBarItems.workflowRunner)}>
                            <span className="sidebar-icon"><Schema fontSize="small"/></span>
                            <span>Workflow runner</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="documentation"
                              className={selected === SideBarItems.projectDoc ? "active" : ""}
                              onClick={() => setSelected(SideBarItems.projectDoc)}>
                            <span className="sidebar-icon"><InsertDriveFile fontSize="small"/></span>
                            <span>Project documentation</span>
                        </Link>
                    </li>
                </ul>
            </div>
            <Outlet/>
        </>
    );
}
