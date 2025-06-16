/* eslint-disable max-len */
import { render, screen, waitFor } from "@testing-library/react";
import { UseFormReturn } from "react-hook-form";
import { AddScopedPermissionInput } from "../../../../../app/components/contents/manageAccess/updatePermission/AddScopedPermissionInput";
import userEvent from "@testing-library/user-event";
import { mockPacketGroupDtos, mockPacketGroupResponse, mockTags } from "../../../../mocks";

const getForm = (id: number | string, name: string) =>
  ({
    watch: jest.fn(() => ({ id, name })),
    setValue: jest.fn()
  }) as unknown as UseFormReturn<any>;

describe("AddScopedPermissionInput", () => {
  it("should disable input when scope is global", async () => {
    render(<AddScopedPermissionInput scope="global" form={getForm(1, "random")} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("should show correct placeholder when no scopedPermission", async () => {
    const form = getForm("", "");
    render(<AddScopedPermissionInput scope="packet" form={form} />);

    expect(screen.getByRole("combobox")).toBeEnabled();
    expect(screen.getByText(/select resource.../i)).toBeVisible();
  });

  it("should allow selecting of tags if scope is tag & allow search", async () => {
    const form = getForm(1, "tag69");
    render(<AddScopedPermissionInput scope="tag" form={form} />);

    expect(screen.getByText(/tag69/i)).toBeVisible();
    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      mockTags.content.forEach((tag) => {
        expect(screen.getByText(tag.name)).toBeVisible();
      });
    });

    userEvent.type(screen.getByPlaceholderText("Search tags..."), "random search");
    userEvent.click(screen.getByRole("option", { name: mockTags.content[0].name }));

    expect(form.setValue).toHaveBeenCalledWith("scopeResource", {
      id: mockTags.content[0].id.toString(),
      name: mockTags.content[0].name
    });
  });

  it("should allow selecting of packets if scope is packet & allow search", async () => {
    const form = getForm("1234", "packet69");
    render(<AddScopedPermissionInput scope="packet" form={form} />);

    expect(screen.getByText(/1234/i)).toBeVisible();
    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      mockPacketGroupResponse.content.forEach((packet) => {
        expect(screen.getByText(`${packet.name}:${packet.id}`)).toBeVisible();
      });
    });

    userEvent.type(screen.getByPlaceholderText("Search packets..."), "random search");
    userEvent.click(
      screen.getByRole("option", {
        name: `${mockPacketGroupResponse.content[0].name}:${mockPacketGroupResponse.content[0].id}`
      })
    );

    expect(form.setValue).toHaveBeenCalledWith("scopeResource", {
      id: mockPacketGroupResponse.content[0].id,
      name: mockPacketGroupResponse.content[0].name
    });
  });

  it("should allow selecting of packetGroups if scope is packetGroup & allow search", async () => {
    const form = getForm(1, "packetGroup69");
    render(<AddScopedPermissionInput scope="packetGroup" form={form} />);

    expect(screen.getByText(/packetGroup69/i)).toBeVisible();
    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      mockPacketGroupDtos.content.forEach((packetGroup) => {
        expect(screen.getByText(packetGroup.name)).toBeVisible();
      });
    });

    userEvent.type(screen.getByPlaceholderText("Search packetGroups..."), "random search");
    userEvent.click(screen.getByRole("option", { name: mockPacketGroupDtos.content[0].name }));

    expect(form.setValue).toHaveBeenCalledWith("scopeResource", {
      id: mockPacketGroupDtos.content[0].id.toString(),
      name: mockPacketGroupDtos.content[0].name
    });
  }, 4000);

  it("should set scopeResource to empty object when scope changes", async () => {
    const form = getForm(1, "packetGroup69");
    const { rerender } = render(<AddScopedPermissionInput scope="packetGroup" form={form} />);

    expect(screen.getByText(/packetGroup69/i)).toBeVisible();

    rerender(<AddScopedPermissionInput form={form} scope="global" />);

    expect(form.setValue).toHaveBeenCalledWith("scopeResource", { id: "", name: "" });
    expect(form.setValue).toHaveBeenCalledTimes(2);
  });
});
