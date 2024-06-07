import { render, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line max-len
import { AddPermissionForUpdateForm } from "../../../../../app/components/contents/manageAccess/updatePermission/AddPermissionForUpdateForm";
import userEvent from "@testing-library/user-event";
import { mockPacketGroupResponse, mockTags } from "../../../../mocks";
import { Tag } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";

describe("AddPermissionForUpdateForm", () => {
  it("it should disable scope radio group if permission is not set or user.manage", async () => {
    render(<AddPermissionForUpdateForm addPermission={jest.fn()} currentAddPermissions={[]} />);
    const radioButtons = screen.getAllByRole("radio");
    const select = screen.getAllByRole("combobox", { hidden: true })[1];

    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });

    userEvent.selectOptions(select, "user.manage");
    await waitFor(() => {
      radioButtons.forEach((radioButton) => {
        expect(radioButton).toBeDisabled();
      });
    });
  });

  it("should set scope to global if permission is user.manage", async () => {
    render(<AddPermissionForUpdateForm addPermission={jest.fn()} currentAddPermissions={[]} />);
    const select = screen.getAllByRole("combobox", { hidden: true })[1];

    userEvent.selectOptions(select, "user.manage");
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "global" })).toBeChecked();
    });
  });

  it("should submit form with correct values for permission and global scope", async () => {
    const addPermission = jest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentAddPermissions={[]} />);

    const select = screen.getAllByRole("combobox", { hidden: true })[1];
    userEvent.selectOptions(select, "user.manage");
    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "user.manage" });
    });
  });

  it("should submit form with correct values for permission and packet scope", async () => {
    const testPacket = { id: mockPacketGroupResponse.content[0].id, name: mockPacketGroupResponse.content[0].name };
    const addPermission = jest.fn();

    render(<AddPermissionForUpdateForm addPermission={addPermission} currentAddPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.read");
    userEvent.click(screen.getByRole("radio", { name: "packet" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(testPacket.id);
    userEvent.click(screen.getByRole("option", { name: testPacket.id }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "packet.read", packet: testPacket });
    });
  });

  it("should submit form with correct values for permission and tag scope", async () => {
    const addPermission = jest.fn();
    const testTag = { ...mockTags.content[0] };
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentAddPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.push");
    userEvent.click(screen.getByRole("radio", { name: "tag" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(testTag.name);
    userEvent.click(screen.getByRole("option", { name: testTag.name }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "packet.push", tag: testTag });
    });
  });

  it("should show error if permission and not global scope set but no scopeResource", async () => {
    const addPermission = jest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentAddPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.push");
    userEvent.click(screen.getByRole("radio", { name: "tag" }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/scoped name is required if not global scope/i)).toBeVisible();
    });
  });

  it("should not show error on submit if permission not set", async () => {
    const addPermission = jest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentAddPermissions={[]} />);

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeVisible();
    });
  });

  it("should show error if duplicate permission is added", async () => {
    const addPermission = jest.fn();
    const testTag = { ...mockTags.content[0] } as Tag;
    render(
      <AddPermissionForUpdateForm
        addPermission={addPermission}
        currentAddPermissions={[{ permission: "packet.push", tag: testTag }]}
      />
    );

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.push");
    userEvent.click(screen.getByRole("radio", { name: "tag" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(testTag.name);
    userEvent.click(screen.getByRole("option", { name: testTag.name }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/permission already added/i)).toBeVisible();
    });
  });
});
