import React, {useEffect, useState} from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {SideBarItems, SidebarProps} from "../../types";

export default function Sidebar({onChangeSideBar}: SidebarProps) {
    const [selected, setSelected] = useState(0);

    const handleSelected = (input: number) => {
        setSelected(input);
    };

    useEffect(() => {
        onChangeSideBar(selected);
    }, [selected]);

    return (
        <div className="sidebar">
            <ul className="list-unstyled">
                <li className="pt-2">
                    <a href="#" className={selected === SideBarItems.explorer ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.explorer)}>
                        <span className="sidebar-icon">
                            <FindInPage fontSize="small"/></span>
                        <span className="item">Packet explorer</span>
                    </a>
                </li>
                <li className="pt-2">
                    <a href="#"
                       className={selected === SideBarItems.runPacket ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.runPacket)}>
                        <span className="sidebar-icon">
                      <Inventory fontSize="small"/></span>
                        <span className="item">Run a packet</span>
                    </a>
                </li>
                <li className="pt-2">
                    <a href="#" className={selected === SideBarItems.runWorkflow ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.runWorkflow)}>
                        <span className="sidebar-icon">
                        <Schema fontSize="small"/></span>
                        <span className="item">Run a workflow</span>
                    </a>
                </li>
                <li className="pt-2">
                    <a href="#" className={selected === SideBarItems.projectDoc ? "active" : ""}
                       onClick={() => handleSelected(SideBarItems.projectDoc)}>
                        <span className="sidebar-icon">
                        <InsertDriveFile fontSize="small"/></span>
                        <span className="item">Project documentation</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}
