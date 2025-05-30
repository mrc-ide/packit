import { render, screen, within } from "@testing-library/react";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import { PacketGroupSummaryListItem } from "../../../../app/components/contents/home/PacketGroupSummaryListItem";
import { mockPacketGroupSummaries, mockUserState } from "../../../mocks";
import { MemoryRouter } from "react-router-dom";
import { UserState } from "../../../../app/components/providers/types/UserTypes";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("PacketGroupSummaryListItem", () => {
  const mockPacketGroup = mockPacketGroupSummaries.content[0];
  // TODO: fix tests
  const renderComponent = () =>
    render(
      <UserProvider>
        <MemoryRouter>
          <PacketGroupSummaryListItem
            packetGroup={mockPacketGroup}
            rolesAndUsersToUpdateRead={{} as any}
            mutate={jest.fn()}
          />
        </MemoryRouter>
      </UserProvider>
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

  it("should render manage permission dialog button when user has permission", () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    renderComponent();

    expect(screen.getByRole("button", { name: /manage-access/i })).toBeVisible();
  });
});
