import React, {useEffect, useState} from "react";
import {
    FindInPage,
    InsertDriveFile,
    Schema,
    Inventory
} from "@mui/icons-material";
import {SideBarItems, useAppDispatch} from "../../../types";
import {setActiveSideBar} from "../../store/packets/packets";

export default function Sidebar() {
    const dispatch = useAppDispatch();

    const [selected, setSelected] = useState(SideBarItems.explorer);

    useEffect(() => {
        dispatch(setActiveSideBar(selected));
    }, [selected]);

    return (
        <div data-testid="sidebar" className="sidebar">
            <ul className="list-unstyled">
                <li>
                    <a href="#"
                       className={selected === SideBarItems.explorer ? "active" : ""}
                       onClick={() => setSelected(SideBarItems.explorer)}>
                        <span className="sidebar-icon"><FindInPage fontSize="small"/></span>
                        <span>Packet explorer</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.packetRunner ? "active" : ""}
                       onClick={() => setSelected(SideBarItems.packetRunner)}>
                        <span className="sidebar-icon"><Inventory fontSize="small"/>
                        </span><span>Packet runner</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.workflowRunner ? "active" : ""}
                       onClick={() => setSelected(SideBarItems.workflowRunner)}>
                        <span className="sidebar-icon"><Schema fontSize="small"/></span>
                        <span>Workflow runner</span>
                    </a>
                </li>
                <li>
                    <a href="#"
                       className={selected === SideBarItems.projectDoc ? "active" : ""}
                       onClick={() => setSelected(SideBarItems.projectDoc)}>
                        <span className="sidebar-icon"><InsertDriveFile fontSize="small"/></span>
                        <span>Project documentation</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}
