import { Route, Routes } from "react-router-dom";
import { App } from "../../App";
import { NotFound } from "../NotFound";
import { Downloads, Home, Metadata, PacketGroup } from "../contents";
import { PacketDetails, PacketFileFullScreen } from "../contents/packets";
import { Login, Redirect, UpdatePassword, AuthLayoutForm } from "../login";
import { Breadcrumb } from "../main/Breadcrumb";
import { PacketLayout } from "../main";
import { ProtectedRoute } from "./ProtectedRoute";
import { ManageAccessLayout, ManageRoles, ManageUsers } from "../contents/manageAccess";
import { PacketRun, PacketRunTaskLogs, PacketRunTasksLogs, PacketRunnerLayout } from "../contents/runner";
import { PacketOutlet } from "../main/PacketOutlet";
import { PacketReadPermission } from "../contents/PacketReadPermission";

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
            <Route element={<ManageAccessLayout />}>
              <Route path="manage-roles" element={<ManageRoles />} />
              <Route path="manage-users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<PacketOutlet />}>
          <Route path="/:packetName/:packetId/file/*" element={<PacketFileFullScreen />} />
        </Route>
      </Route>
    </Routes>
  );
};
