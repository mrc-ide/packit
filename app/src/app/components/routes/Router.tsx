import { Route, Routes } from "react-router-dom";
import { Explorer, PacketRunner, ProjectDocumentation, WorkflowRunner } from "../contents";
import PacketDetails from "../contents/packets/PacketDetails";
import { NotFound } from "../NotFound";
import { Download } from "../contents/download";
import { ChangeLogs } from "../contents/changelogs";
import { Metadata } from "../contents/metadata";
import { Login, Redirect } from "../login";
import ProtectedRoute from "./ProtectedRoute";
import { Breadcrumb } from "../main/Breadcrumb";
import { Sidebar } from "../main/Sidebar";

export function Router() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="redirect" element={<Redirect />} />
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Breadcrumb />}>
          <Route index element={<Explorer />} />
          <Route path="runner" element={<PacketRunner />} />
          <Route path="run-workflow" element={<WorkflowRunner />} />
          <Route path="documentation" element={<ProjectDocumentation />} />
          <Route element={<Sidebar />} path="/:packetId">
            <Route path="/:packetId" element={<PacketDetails />} />
            <Route path="/:packetId/metadata" element={<Metadata />} />
            <Route path="/:packetId/downloads" element={<Download />} />
            <Route path="/:packetId/changelogs" element={<ChangeLogs />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
