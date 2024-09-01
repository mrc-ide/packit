import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunTaskLogs } from "../../../../app/components/contents/runner/PacketRunTaskLogs";

describe("PacketRunTaskLogs", () => {
  const testTaskId = "1234";
  const renderComponent = () => {
    render(
      <MemoryRouter initialEntries={[`/runner/logs/${testTaskId}`]}>
        <Routes>
          <Route path="/runner/logs/:taskId" element={<PacketRunTaskLogs />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should render taskId retrieved from url params", () => {
    renderComponent();
    expect(screen.getByText(testTaskId, { exact: false })).toBeVisible();
  });
});
