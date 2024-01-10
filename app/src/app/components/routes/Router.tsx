import { Route, Routes } from "react-router-dom";
import { NotFound } from "../NotFound";
import { PacketRunner, ProjectDocumentation, WorkflowRunner } from "../contents";
import { PacketGroup } from "../contents/PacketGroup";
import { Accessibility } from "../contents/accessibility";
import { ChangeLogs } from "../contents/changelogs";
import { Download } from "../contents/download";
import { Home } from "../contents/explorer";
import { Metadata } from "../contents/metadata";
import PacketDetails from "../contents/packets/PacketDetails";
import { Login, Redirect } from "../login";
import { Breadcrumb } from "../main/Breadcrumb";
import { PacketLayout } from "../main/PacketLayout";
import ProtectedRoute from "./ProtectedRoute";
import {PacketOutlet} from "../main/PacketOutlet";
import {PacketFileFullScreen} from "../contents/packets/PacketFileFullScreen";

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
          <Route index element={<Home />} />
          <Route path="runner" element={<PacketRunner />} />
          <Route path="run-workflow" element={<WorkflowRunner />} />
          <Route path="documentation" element={<ProjectDocumentation />} />
          <Route path="/:packetName" element={<PacketGroup />} />
          <Route element={<PacketLayout />} path="/:packetName/:packetId">
            <Route path="/:packetName/:packetId" element={<PacketDetails />} />
            <Route path="/:packetName/:packetId/metadata" element={<Metadata />} />
            <Route path="/:packetName/:packetId/downloads" element={<Download />} />
            <Route path="/:packetName/:packetId/changelogs" element={<ChangeLogs />} />
          </Route>
        </Route>
        <Route path="/:packetName/:packetId/file/:fileName" element={<PacketFileFullScreen />} />
      </Route>
    </Routes>
  );
}
