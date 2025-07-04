import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { PacketRunForm } from "@components/contents/runner/run/PacketRunForm";
import { getTimeDifferenceToDisplay } from "@lib/time";
import { basicRunnerUri } from "@/msw/handlers/runnerHandlers";
import { server } from "@/msw/server";
import { mockGitBranches } from "@/tests/mocks";

const renderComponent = () => {
  const mutate = vitest.fn();
  render(
    <MemoryRouter initialEntries={["/runner"]}>
      <Routes>
        <Route
          path="/runner"
          element={<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={mutate} />}
        />
        <Route path="runner/logs/:taskId" element={<div>Task logs</div>} />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );
  return mutate;
};
describe("PacketRunForm component", () => {
  it("should render default branch information and default select value", async () => {
    const mainCommitTime = getTimeDifferenceToDisplay(mockGitBranches.branches[1].time)[0];
    renderComponent();

    const select = screen.getByRole("combobox");

    expect(select).toHaveTextContent(mockGitBranches.defaultBranch);
    expect(screen.getByText(mockGitBranches.branches[1].commitHash.slice(0, 7))).toBeVisible();
    expect(screen.getByText(`Updated ${mainCommitTime.value} ${mainCommitTime.unit} ago`)).toBeVisible();
  });

  it("should be able to switch branches and update info", async () => {
    const branch1CommitTime = getTimeDifferenceToDisplay(mockGitBranches.branches[0].time)[0];
    const branch2CommitTime = getTimeDifferenceToDisplay(mockGitBranches.branches[1].time)[0];
    renderComponent();

    const select = screen.getAllByRole("combobox", { hidden: true })[1];
    userEvent.selectOptions(select, mockGitBranches.branches[0].name);

    await waitFor(() => {
      expect(select).toHaveTextContent(mockGitBranches.branches[0].name);
    });

    expect(screen.getByText(mockGitBranches.branches[0].commitHash.slice(0, 7))).toBeVisible();
    expect(screen.getByText(`Updated ${branch1CommitTime.value} ${branch1CommitTime.unit} ago`)).toBeVisible();

    userEvent.selectOptions(select, mockGitBranches.branches[1].name);

    await waitFor(() => {
      expect(select).toHaveTextContent(mockGitBranches.branches[1].name);
    });

    expect(screen.getByText(mockGitBranches.branches[1].commitHash.slice(0, 7))).toBeVisible();
    expect(screen.getByText(`Updated ${branch2CommitTime.value} ${branch2CommitTime.unit} ago`)).toBeVisible();
  });

  it("should display tooltip on git fetch button hover", async () => {
    renderComponent();

    const gitFetchButton = screen.getByRole("button", { name: /git-fetch/i });
    userEvent.hover(gitFetchButton);

    await waitFor(() => {
      expect(screen.getAllByText("Fetch git branches")[0]).toBeVisible();
    });
  });

  it("should do correct actions when git fetch button clicked", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        expect(req.url.href).toBe(`${basicRunnerUri}/git/fetch`);

        return res(ctx.status(201));
      })
    );
    const mutate = renderComponent();

    const gitFetchButton = screen.getByRole("button", { name: /git-fetch/i });
    userEvent.click(gitFetchButton);

    await waitFor(() => {
      expect(gitFetchButton.querySelector("svg")).toHaveClass("animate-spin");
    });
    expect(gitFetchButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Git branches fetched successfully.")).toBeVisible();
    });
    expect(mutate).toHaveBeenCalled();
    expect(gitFetchButton).not.toBeDisabled();
    expect(gitFetchButton.querySelector("svg")).not.toHaveClass("animate-spin");
  });

  it("should show error toast when error fetching git branches", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    renderComponent();

    const gitFetchButton = screen.getByRole("button", { name: /git-fetch/i });
    userEvent.click(gitFetchButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch git branches. Please try again.")).toBeVisible();
    });
  });

  it("should display fields for packet group and parameters", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/select packet group/i)).toBeVisible();
    });
    expect(screen.getByText(/branch/i)).toBeVisible();
    expect(screen.getByText(/packet group parameters/i)).toBeVisible();
  });

  it("should show error message when form displayed with empty packet Group", async () => {
    renderComponent();

    const runButton = screen.getByRole("button", { name: /run/i });
    userEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/packet group name is required/i)).toBeVisible();
    });
  });

  it("should show error message when form displayed with empty parameters", async () => {
    renderComponent();

    const packetGroupSelect = await screen.findByRole("combobox", { name: /packet group/i });
    userEvent.click(packetGroupSelect);
    userEvent.click(screen.getByRole("option", { name: /parameters/i }));

    await screen.findByText(/packet group parameters/i);
    await screen.findByText(/param1/i);

    userEvent.click(screen.getByRole("button", { name: /run/i }));

    await waitFor(() => {
      expect(screen.getByText(/Must enter a number, string or boolean/i)).toBeVisible();
    });
  });

  it("should display error message when git fetch fails", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    renderComponent();

    userEvent.click(screen.getByRole("button", { name: /git-fetch/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch git branches. Please try again.")).toBeVisible();
    });
  });

  it("should submit run when form submitted correctly & navigate to task run logs", async () => {
    server.use(
      rest.post("*", async (req, res, ctx) => {
        expect(req.url.href).toBe(`${basicRunnerUri}/run`);
        const body = await req.json();

        expect(body).toEqual({
          name: "parameters",
          branch: "main",
          hash: mockGitBranches.branches[1].commitHash,
          parameters: {
            param1: "value1",
            param2: "value2"
          }
        });

        return res(ctx.json({ taskId: "1234" }));
      })
    );
    renderComponent();

    const packetGroupSelect = await screen.findByRole("combobox", { name: /packet group/i });
    userEvent.click(packetGroupSelect);
    userEvent.click(screen.getByRole("option", { name: /parameters/i }));

    const param1 = await screen.findByLabelText(/param1/i);
    const param2 = screen.getByLabelText(/param2/i);

    userEvent.clear(param1);
    userEvent.clear(param2);
    userEvent.type(param1, "value1");
    userEvent.type(param2, "value2");

    userEvent.click(screen.getByRole("button", { name: /run/i }));

    await waitFor(() => {
      expect(screen.getByText("Task logs")).toBeVisible();
    });
  });

  it("should render error message when submit run erros", async () => {
    const errorMessage = "test error message";
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    renderComponent();

    const packetGroupSelect = await screen.findByRole("combobox", { name: /packet group/i });
    userEvent.click(packetGroupSelect);
    userEvent.click(screen.getByRole("option", { name: /explicit/i }));

    userEvent.click(screen.getByRole("button", { name: /run/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });
});
