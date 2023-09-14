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
import {ProtectedRoute} from "./ProtectedRoute";

export function Router() {
    return (
        <Routes>
            <Route path={"login"} element={<Login/>}/>
            <Route path="redirect" element={<Redirect/>}/>
            <Route path="*" element={<ProtectedRoute element={<NotFound/>}/>}/>
            <Route element={<Sidebar/>}>
                <Route index element={<ProtectedRoute element={<Explorer/>}/>}/>
                <Route path="packets" element={<ProtectedRoute element={<Explorer/>}/>}/>
                <Route path="run" element={<ProtectedRoute element={<PacketRunner/>}/>}/>
                <Route path="run-workflow" element={<ProtectedRoute element={<WorkflowRunner/>}/>}/>
                <Route path="documentation" element={<ProtectedRoute element={<ProjectDocumentation/>}/>}/>
                <Route path="packets/:packetId" element={<ProtectedRoute element={<PacketDetails/>}/>}/>
                <Route path="packets/:packetId/metadata" element={<ProtectedRoute element={<Metadata/>}/>}/>
                <Route path="packets/:packetId/downloads" element={<ProtectedRoute element={<Download/>}/>}/>
                <Route path="packets/:packetId/changelogs" element={<ProtectedRoute element={<ChangeLogs/>}/>}/>
            </Route>
        </Routes>
    );
}
