/* eslint-disable max-len */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { Command } from "../../../../../app/components/Base/Command";
import { PermissionScopeCommandList } from "../../../../../app/components/contents/manageAccess/updatePermission/PermissionScopeCommandList";
import { server } from "../../../../../msw/server";
import { mockPacketGroupResponse, mockTags } from "../../../../mocks";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

const renderComponent = (children: ReactNode) =>
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <Command>{children}</Command>
    </SWRConfig>
  );

describe("PermissionCommandList", () => {
  it("should call setScopeResource, setFilterName and setOpen on select", async () => {
    const setFilterName = jest.fn();
    const setOpen = jest.fn();
    const setScopeResource = jest.fn();
    renderComponent(
      <PermissionScopeCommandList
        scope="tag"
        filterName=""
        scopeResource={{ id: "11", name: "tag1" }}
        setFilterName={setFilterName}
        setOpen={setOpen}
        setScopeResource={setScopeResource}
      />
    );

    const firstTag = await screen.findByText(mockTags.content[0].name);
    userEvent.click(firstTag);

    expect(setScopeResource).toHaveBeenCalledWith({
      id: mockTags.content[0].id.toString(),
      name: mockTags.content[0].name
    });
    expect(setFilterName).toHaveBeenCalledWith("");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("should render check on selected and call setScopeResource with default values on unselect", async () => {
    const testPacket = { id: mockPacketGroupResponse.content[0].id, name: mockPacketGroupResponse.content[0].name };
    const scopeResource = { id: testPacket.id, name: testPacket.name };
    const setScopeResource = jest.fn();
    renderComponent(
      <PermissionScopeCommandList
        scope="packet"
        filterName=""
        scopeResource={scopeResource}
        setFilterName={jest.fn()}
        setOpen={jest.fn()}
        setScopeResource={setScopeResource}
      />
    );

    const secondPacketGroup = await screen.findByText(testPacket.id);
    expect(screen.getByTestId(`check-${testPacket.id}`)).toHaveClass("opacity-100");

    userEvent.click(secondPacketGroup);

    expect(setScopeResource).toHaveBeenCalledWith({ id: "", name: "" });
  });

  it("should error when fails to fetch data", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    renderComponent(
      <PermissionScopeCommandList
        scope="tag"
        filterName=""
        scopeResource={{ id: "11", name: "tag1" }}
        setFilterName={jest.fn()}
        setOpen={jest.fn()}
        setScopeResource={jest.fn()}
      />
    );

    expect(await screen.findByText(/Error Fetching data/i)).toBeVisible();
  });
});
