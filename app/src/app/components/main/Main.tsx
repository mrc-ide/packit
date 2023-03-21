import React, {useState} from "react";
import {Sidebar} from "./index";
import {
    Explorer,
    PacketRunner,
    WorkflowRunner,
    ProjectDocumentation
} from "./../contents";
import {SideBarItems} from "../../types";

export default function Main() {
    const [activeNavBar, setActiveNavBar] = useState(SideBarItems.explorer);
    return (
        <main>
            <Sidebar onChangeSideBar={(e) => setActiveNavBar(e)}/>
            <div className="content">
                {activeNavBar === SideBarItems.explorer && <Explorer/>}
                {activeNavBar === SideBarItems.packetRunner && <PacketRunner/>}
                {activeNavBar === SideBarItems.workflowRunner && <WorkflowRunner/>}
                {activeNavBar === SideBarItems.projectDoc && <ProjectDocumentation/>}
            </div>
        </main>
    );
}
