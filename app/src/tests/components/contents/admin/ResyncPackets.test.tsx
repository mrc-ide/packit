import { render, screen } from "@testing-library/react";
import * as UserProviderModule from "@components/providers/UserProvider";
import { ResyncPackets } from "@components/contents/admin";

const mockUseUser = vitest.spyOn(UserProviderModule, "useUser");
const renderComponent = () =>
  render(
    <UserProviderModule.UserProvider>
      <ResyncPackets />
    </UserProviderModule.UserProvider>
  );

describe("ResyncPackets", () => {
  afterEach(() => {
    vitest.clearAllMocks();
  });

  const unauthorizedText = /You do not have permission to access this page/;

  it("renders button if user has packet manage permission", async () => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.manage"]
    } as any);
    renderComponent();
    expect(await screen.findByRole("button", { name: "Resync packets" })).toBeInTheDocument();
    expect(await screen.queryByText(unauthorizedText, {})).toBeNull();
  });

  it("renders unauthorized if user does not have packet manage permission", async () => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.read"]
    } as any);
    renderComponent();
    expect(await screen.findByText(unauthorizedText, {})).toBeInTheDocument();
    expect(await screen.queryByRole("button", { name: "Resync packets" })).toBeNull();
  });
});
