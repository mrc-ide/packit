import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockPacket } from "../../../../mocks";
import { Custom } from "../../../../../types";
import { OrderlyDownloads } from "../../../../../app/components/contents/downloads/orderly/OrderlyDownloads";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";

const renderComponent = (customMetadata: Custom) => {
  const packet = { ...mockPacket, custom: customMetadata };
  const routes = [
    {
      path: "/",
      element: <Outlet context={{ packet }} />,
      children: [{ path: "/", element: <OrderlyDownloads /> }]
    }
  ];
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });

  render(<RouterProvider router={router} />);
};

describe("orderly downloads component", () => {
  it("renders the 'artefacts' and 'other files' accordion sections with only the first open", async () => {
    renderComponent(mockPacket.custom as Custom);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("a_renamed_common_resource.csv")).toBeNull();

    userEvent.click(screen.getByText("Other files"));
    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(await screen.findByText("orderly.R")).toBeVisible();
  });

  it("renders no accordion when there are no 'other files'", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(screen.queryByText("Other files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders no accordion when there are no artefacts", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Files")).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders a message when there are no files", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [], artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText(/There are no artefacts/)).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });
});