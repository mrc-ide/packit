import React from "react";
import {Sidebar} from "./index";
import {
    Explorer,
    PacketRunner,
    WorkflowRunner,
    ProjectDocumentation
} from "./../contents";
import {RootState, SideBarItems} from "../../../types";
import {useSelector} from "react-redux";

export default function Main() {
    const {activeSideBar} = useSelector((state: RootState) => state.packets);

    return (
        <main data-testid="main">
            <Sidebar/>
            <div data-testid="content" >
                {activeSideBar === SideBarItems.explorer && <Explorer/>}
                {activeSideBar === SideBarItems.packetRunner && <PacketRunner/>}
                {activeSideBar === SideBarItems.workflowRunner && <WorkflowRunner/>}
                {activeSideBar === SideBarItems.projectDoc && <ProjectDocumentation/>}
            </div>
        </main>
    );
}
