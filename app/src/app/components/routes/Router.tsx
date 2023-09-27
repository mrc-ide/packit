import {Route, Routes} from "react-router-dom";
import {Explorer, PacketRunner, ProjectDocumentation, WorkflowRunner} from "../contents";
import PacketDetails from "../contents/packets/PacketDetails";
import React from "react";
import {Sidebar} from "../main";
import {NotFound} from "../NotFound";
import {Download} from "../contents/download";
import {ChangeLogs} from "../contents/changelogs";
import {Metadata} from "../contents/metadata";
import {Login, Redirect} from "../login";
import ProtectedRoute from "./ProtectedRoute";

export function Router() {
    return (
        <Routes>
            <Route path="login" element={<Login/>}/>
            <Route path="redirect" element={<Redirect/>}/>
            <Route element={<ProtectedRoute/>}>
                <Route path="*" element={<NotFound/>}/>
            </Route>
            <Route element={<Sidebar/>}>
                <Route element={<ProtectedRoute/>}>
                    <Route index element={<Explorer/>}/>
                    <Route path="packets" element={<Explorer/>}/>
                    <Route path="run" element={<PacketRunner/>}/>
                    <Route path="run-workflow" element={<WorkflowRunner/>}/>
                    <Route path="documentation" element={<ProjectDocumentation/>}/>
                    <Route path="packets/:packetId" element={<PacketDetails/>}/>
                    <Route path="packets/:packetId/metadata" element={<Metadata/>}/>
                    <Route path="packets/:packetId/downloads" element={<Download/>}/>
                    <Route path="packets/:packetId/changelogs" element={<ChangeLogs/>}/>
                </Route>
            </Route>
        </Routes>
    );
}
