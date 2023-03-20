import React, {useState} from "react";
import Sidebar from "./Sidebar";
import {
    Explorer,
    RunPacket,
    RunWorkflow,
    ProjectDocumentation
} from "./../contents";
import {SideBarItems} from "../../types";

export default function Main() {
    const [activeNavBar, setActiveNavBar] = useState(0);
    return (
        <main>
            <Sidebar onChangeSideBar={(e) => setActiveNavBar(e)}/>
            <div className="content">
                {activeNavBar === SideBarItems.explorer && <Explorer/>}
                {activeNavBar === SideBarItems.runPacket && <RunPacket/>}
                {activeNavBar === SideBarItems.runWorkflow && <RunWorkflow/>}
                {activeNavBar === SideBarItems.projectDoc && <ProjectDocumentation/>}
            </div>
        </main>
    );
}
