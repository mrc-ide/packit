/* eslint-disable max-len */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { Command } from "@components/Base/Command";
import { PermissionScopeCommandList } from "@components/contents/manageAccess/updatePermission/PermissionScopeCommandList";
import { server } from "@/msw/server";
import { mockPacketGroupResponse, mockTags } from "@/tests/mocks";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

const renderComponent = (children: ReactNode) =>
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <Command>{children}</Command>
    </SWRConfig>
  );

describe("PermissionCommandList", () => {
  it("should call setScopeResource, setFilterName and setOpen on select", async () => {
    const setFilterName = vitest.fn();
    const setOpen = vitest.fn();
    const setScopeResource = vitest.fn();
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
    const setScopeResource = vitest.fn();
    renderComponent(
      <PermissionScopeCommandList
        scope="packet"
        filterName=""
        scopeResource={scopeResource}
        setFilterName={vitest.fn()}
        setOpen={vitest.fn()}
        setScopeResource={setScopeResource}
      />
    );

    const secondPacketGroup = await screen.findByText(`${testPacket.name}:${testPacket.id}`);
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
        setFilterName={vitest.fn()}
        setOpen={vitest.fn()}
        setScopeResource={vitest.fn()}
      />
    );

    expect(await screen.findByText(/Error Fetching data/i)).toBeVisible();
  });
});
