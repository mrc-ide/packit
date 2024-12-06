import { Route, Routes } from "react-router-dom";
import App from "../../App";
import { NotFound } from "../NotFound";
import { PacketGroup } from "../contents/PacketGroup";
import { Download } from "../contents/download";
import { Home } from "../contents/home";
import { Metadata } from "../contents/metadata";
import PacketDetails from "../contents/packets/PacketDetails";
import { PacketFileFullScreen } from "../contents/packets/PacketFileFullScreen";
import { Login, Redirect } from "../login";
import { Breadcrumb } from "../main/Breadcrumb";
import { PacketLayout } from "../main/PacketLayout";
import ProtectedRoute from "./ProtectedRoute";
import { UpdatePassword } from "../login";
import { AuthLayoutForm } from "../login";
import { ManageAccessLayout, ManageRoles, ManageUsers } from "../contents/manageAccess";
import { PacketRun, PacketRunTasksLogs, PacketRunnerLayout } from "../contents/runner";
import { PacketRunTaskLogs } from "../contents/runner/PacketRunTaskLogs";

export function Router() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route element={<AuthLayoutForm />}>
          <Route path="login" element={<Login />} />
          <Route path="update-password" element={<UpdatePassword />} />
        </Route>
        {/* <Route path="accessibility" element={<Accessibility />} /> */}
        <Route path="redirect" element={<Redirect />} />
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<Breadcrumb />}>
            <Route index element={<Home />} />
            <Route element={<PacketRunnerLayout />}>
              <Route path="runner" element={<PacketRun />} />
              <Route path="runner/logs" element={<PacketRunTasksLogs />} />
              <Route path="runner/logs/:taskId" element={<PacketRunTaskLogs />} />
            </Route>
            {/* <Route path="run-workflow" element={<WorkflowRunner />} /> */}
            {/* <Route path="documentation" element={<ProjectDocumentation />} /> */}
            <Route path="/:packetName" element={<PacketGroup />} />
            <Route element={<PacketLayout />}>
              <Route path="/:packetName/:packetId" element={<PacketDetails />} />
              <Route path="/:packetName/:packetId/metadata" element={<Metadata />} />
              <Route path="/:packetName/:packetId/downloads" element={<Download />} />
              {/* <Route path="/:packetName/:packetId/changelogs" element={<ChangeLogs />} /> */}
            </Route>
            <Route element={<ManageAccessLayout />}>
              <Route path="manage-roles" element={<ManageRoles />} />
              <Route path="manage-users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/:packetName/:packetId/file/:fileName" element={<PacketFileFullScreen />} />
      </Route>
    </Routes>
  );
}
