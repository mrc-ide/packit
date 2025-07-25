import { render, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line max-len
import { AddPermissionForUpdateForm } from "@components/contents/admin/updatePermission/AddPermissionForUpdateForm";
import userEvent from "@testing-library/user-event";
import { mockPacketGroupResponse, mockPackets } from "@/tests/mocks";

describe("AddPermissionForUpdateForm", () => {
  it("it should disable scope radio group, submit button if permission is not set to a scoped permission", async () => {
    render(<AddPermissionForUpdateForm addPermission={vitest.fn()} currentPermissions={[]} />);
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

  it("should set scope to global if permission is not a scoped permission", async () => {
    render(<AddPermissionForUpdateForm addPermission={vitest.fn()} currentPermissions={[]} />);
    const select = screen.getAllByRole("combobox", { hidden: true })[1];

    userEvent.selectOptions(select, "user.manage");
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "global" })).toBeChecked();
    });
  });

  it("should submit form with correct values for permission and global scope", async () => {
    const addPermission = vitest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

    const select = screen.getAllByRole("combobox", { hidden: true })[1];
    userEvent.selectOptions(select, "user.manage");
    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "user.manage" });
    });
  });

  it("should submit form with correct values for packet.read permission and packet scope", async () => {
    const testPacket = { id: mockPacketGroupResponse.content[0].id, name: mockPacketGroupResponse.content[0].name };
    const addPermission = vitest.fn();

    render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.read");
    userEvent.click(screen.getByRole("radio", { name: "packet" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(`${testPacket.name}:${testPacket.id}`);
    userEvent.click(screen.getByRole("option", { name: `${testPacket.name}:${testPacket.id}` }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "packet.read", packet: testPacket });
    });
  });

  // TODO: Uncomment the following test if you want to test the tag scope functionality
  // it("should submit form with correct values for packet.read permission and tag scope", async () => {
  //   const addPermission = vitest.fn();
  //   const testTag = { ...mockTags.content[0] };
  //   render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

  //   const allComboBox = screen.getAllByRole("combobox", { hidden: true });
  //   userEvent.selectOptions(allComboBox[1], "packet.read");
  //   userEvent.click(screen.getByRole("radio", { name: "tag" }));

  //   userEvent.click(allComboBox[2]);
  //   await screen.findByText(testTag.name);
  //   userEvent.click(screen.getByRole("option", { name: testTag.name }));

  //   userEvent.click(screen.getByRole("button"));

  //   await waitFor(() => {
  //     expect(addPermission).toHaveBeenCalledWith({ permission: "packet.read", tag: testTag });
  //   });
  // });

  it("should show error if packet.read permission and not global scope set but no scopeResource", async () => {
    const addPermission = vitest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.read");
    userEvent.click(screen.getByRole("radio", { name: "packet group" }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/select a resource for non-global scope/i)).toBeVisible();
    });
  });

  it("should disable add permission button when no permission selected", async () => {
    const addPermission = vitest.fn();
    render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

    expect(screen.getByRole("button", { name: /add permission/i })).toBeDisabled();
  });

  it("should show error if duplicate permission is added", async () => {
    const addPermission = vitest.fn();
    const testPacket = { ...mockPackets[0] };
    render(
      <AddPermissionForUpdateForm
        addPermission={addPermission}
        currentPermissions={[{ permission: "packet.read", packet: testPacket }]}
      />
    );

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.read");
    userEvent.click(screen.getByRole("radio", { name: "packet" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(new RegExp(testPacket.id));
    userEvent.click(screen.getByRole("option", { name: new RegExp(testPacket.id) }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/permission already exists/i)).toBeVisible();
    });
  });

  it("should submit form with correct values for packet.manage permission and packet scope", async () => {
    const testPacket = { id: mockPacketGroupResponse.content[0].id, name: mockPacketGroupResponse.content[0].name };
    const addPermission = vitest.fn();

    render(<AddPermissionForUpdateForm addPermission={addPermission} currentPermissions={[]} />);

    const allComboBox = screen.getAllByRole("combobox", { hidden: true });
    userEvent.selectOptions(allComboBox[1], "packet.manage");
    userEvent.click(screen.getByRole("radio", { name: "packet" }));

    userEvent.click(allComboBox[2]);
    await screen.findByText(`${testPacket.name}:${testPacket.id}`);
    userEvent.click(screen.getByRole("option", { name: `${testPacket.name}:${testPacket.id}` }));

    userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(addPermission).toHaveBeenCalledWith({ permission: "packet.manage", packet: testPacket });
    });
  });
});
