import { Route, Routes } from "react-router-dom";
import { App } from "../../App";
import { Markdown } from "../Base/Markdown";
import { NotFound } from "../NotFound";
import { Downloads, Home, Metadata, PacketGroup } from "../contents";
import { PacketReadPermission } from "../contents/PacketReadPermission";
import { AdminLayout, ManageRoles, ManageUsers, ResyncPackets } from "../contents/admin";
import { PacketDetails, PacketFileFullScreen } from "../contents/packets";
import { PacketRun, PacketRunTaskLogs, PacketRunTasksLogs, PacketRunnerLayout } from "../contents/runner";
import { AuthLayoutForm, Login, Redirect, UpdatePassword } from "../login";
import { PacketLayout } from "../main";
import { Breadcrumb } from "../main/Breadcrumb";
import { ProtectedRoute } from "./ProtectedRoute";

export const Router = () => {
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
              <Route path="/:packetName/:packetId/downloads" element={<Downloads />} />
              <Route path="/:packetName/:packetId/read-access" element={<PacketReadPermission />} />
              {/* <Route path="/:packetName/:packetId/changelogs" element={<ChangeLogs />} /> */}
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="manage-roles" element={<ManageRoles />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-packets" element={<ResyncPackets/>} />
            </Route>
          </Route>
        </Route>
        {/* documentation */}
        <Route
          path="/docs/manage-access-help"
          element={<Markdown mdPath={`${process.env.PUBLIC_URL}/docs/manageAccessHelpPage.md`} />}
        />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/:packetName/:packetId/file/*" element={<PacketFileFullScreen />} />
      </Route>
    </Routes>
  );
};
