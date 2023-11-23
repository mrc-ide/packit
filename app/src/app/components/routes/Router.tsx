import { Route, Routes } from "react-router-dom";
import { NotFound } from "../NotFound";
import { Explorer, PacketRunner, ProjectDocumentation, WorkflowRunner } from "../contents";
import { Accessibility } from "../contents/accessibility";
import { ChangeLogs } from "../contents/changelogs";
import { Download } from "../contents/download";
import { Metadata } from "../contents/metadata";
import PacketDetails from "../contents/packets/PacketDetails";
import { Login, Redirect } from "../login";
import { Breadcrumb } from "../main/Breadcrumb";
import { Sidebar } from "../main/Sidebar";
import ProtectedRoute from "./ProtectedRoute";

export function Router() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="accessibility" element={<Accessibility />} />
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
          {/* // TODO: update show only when packet/:version is present */}
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
