import React, {useEffect, useState} from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {SideBarItems, SidebarProps} from "../../../types";

export default function Sidebar({onChangeSideBar}: SidebarProps) {
    const [selected, setSelected] = useState(0);

    const handleSelected = (input: number) => {
        setSelected(input);
    };

    useEffect(() => {
        onChangeSideBar(selected);
    }, [selected]);

    return (
        <div data-testid="sidebar" className="sidebar">
            <ul className="list-unstyled">
                <li>
                    <a href="#"
                       className={selected === SideBarItems.explorer ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.explorer)}>
                        <span className="sidebar-icon"><FindInPage fontSize="small"/></span>
                        <span>Packet explorer</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.packetRunner ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.packetRunner)}>
                        <span className="sidebar-icon"><Inventory fontSize="small"/>
                        </span><span>Packet runner</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.workflowRunner ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.workflowRunner)}>
                        <span className="sidebar-icon"><Schema fontSize="small"/></span>
                        <span>Workflow runner</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.projectDoc ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.projectDoc)}>
                        <span className="sidebar-icon"><InsertDriveFile fontSize="small"/></span>
                        <span>Project documentation</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}
