import {Route, Routes} from "react-router-dom";
import {Explorer, PacketRunner, ProjectDocumentation, WorkflowRunner} from "../contents";
import PacketDetails from "../contents/packets/PacketDetails";
import React from "react";
import {Sidebar} from "../main";

export function Router() {
    return (
        <>
            <Routes>
                <Route element={<Sidebar/>}>
                    <Route index element={<Explorer/>}/>
                    <Route path="packets" element={<Explorer/>}/>
                    <Route path="run" element={<PacketRunner/>}/>
                    <Route path="run-workflow" element={<WorkflowRunner/>}/>
                    <Route path="documentation" element={<ProjectDocumentation/>}/>
                    <Route path="packets/:packetId" element={<PacketDetails/>}/>
                </Route>
            </Routes>
        </>
    );
}
