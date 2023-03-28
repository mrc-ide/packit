import React, {useState} from "react";
import {Sidebar} from "./index";
import {
    Explorer,
    PacketRunner,
    WorkflowRunner,
    ProjectDocumentation
} from "./../contents";
import {SideBarItems} from "../../../types";

export default function Main() {
    const [activeNavBar, setActiveNavBar] = useState(SideBarItems.explorer);
    return (
        <main data-testid="main">
            <Sidebar onChangeSideBar={(e) => setActiveNavBar(e)}/>
            <div data-testid="content" >
                {activeNavBar === SideBarItems.explorer && <Explorer/>}
                {activeNavBar === SideBarItems.packetRunner && <PacketRunner/>}
                {activeNavBar === SideBarItems.workflowRunner && <WorkflowRunner/>}
                {activeNavBar === SideBarItems.projectDoc && <ProjectDocumentation/>}
            </div>
        </main>
    );
}
