import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PacketGroupSummaryListItem } from "@components/contents/home/PacketGroupSummaryListItem";
import { UserState } from "@components/providers/types/UserTypes";
import * as UserProvider from "@components/providers/UserProvider";
import { mockPacketGroupSummaries, mockUserState } from "@/tests//mocks";

const mockGetUserFromLocalStorage = vitest.fn((): null | UserState => null);
vitest.mock("@lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));
const mockUseUser = vitest.spyOn(UserProvider, "useUser");

describe("PacketGroupSummaryListItem", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.manage"]
    } as any);
  });

  const mockPacketGroup = mockPacketGroupSummaries.content[0];
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <PacketGroupSummaryListItem packetGroup={mockPacketGroup} />
      </MemoryRouter>
    );
  it("should render the packet group summary list item correctly", () => {
    renderComponent();

    const listItem = screen.getByRole("listitem");
    expect(within(listItem).getByRole("link", { name: mockPacketGroup.latestDisplayName })).toHaveAttribute(
      "href",
      `/${mockPacketGroup.name}`
    );
    expect(within(listItem).getByRole("link", { name: /latest/i })).toHaveAttribute(
      "href",
      `/${mockPacketGroup.name}/${mockPacketGroup.latestId}`
    );
    expect(within(listItem).getByText(new RegExp(`${mockPacketGroup.packetCount} packet`))).toBeVisible();
    expect(within(listItem).getByText(mockPacketGroup.name)).toBeVisible();
  });

  it("should render manage permission button when user has permission", () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    renderComponent();

    expect(screen.getByRole("button", { name: /manage-access/i })).toBeVisible();
  });
});
