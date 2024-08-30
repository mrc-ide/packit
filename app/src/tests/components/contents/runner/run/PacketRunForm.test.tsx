import { render, screen, waitFor } from "@testing-library/react";
import { PacketRunForm } from "../../../../../app/components/contents/runner/run/PacketRunForm";
import { mockGitBranches } from "../../../../mocks";
// eslint-disable-next-line max-len
import { getTimeDifferenceToDisplay } from "../../../../../app/components/contents/explorer/utils/getTimeDifferenceToDisplay";
import userEvent from "@testing-library/user-event";
import { server } from "../../../../../msw/server";
import { rest } from "msw";
// import * as fetch from "../../../../../lib/fetch";

// const fetcherSpy = jest.spyOn(fetch, "fetcher");
describe("PacketRunForm component", () => {
  it("should render default branch information and default select value", async () => {
    const mainCommitTime = getTimeDifferenceToDisplay(mockGitBranches.branches[1].time);
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    const select = screen.getByRole("combobox");

    expect(select).toHaveTextContent(mockGitBranches.defaultBranch);
    expect(screen.getByText(mockGitBranches.branches[1].commitHash.slice(0, 7))).toBeVisible();
    expect(screen.getByText(`Updated ${mainCommitTime.value} ${mainCommitTime.unit} ago`)).toBeVisible();
  });

  it("should be able to switch branches and update info", async () => {
    const branch1CommitTime = getTimeDifferenceToDisplay(mockGitBranches.branches[0].time);
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    const select = screen.getAllByRole("combobox", { hidden: true })[1];
    userEvent.selectOptions(select, mockGitBranches.branches[0].name);

    await waitFor(() => {
      expect(select).toHaveTextContent(mockGitBranches.branches[0].name);
    });
    expect(screen.getByText(mockGitBranches.branches[0].commitHash.slice(0, 7))).toBeVisible();
    expect(screen.getByText(`Updated ${branch1CommitTime.value} ${branch1CommitTime.unit} ago`)).toBeVisible();
  });

  it("should display tooltip on git fetch button hover", async () => {
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    const gitFetchButton = screen.getByRole("button", { name: /git-fetch/i });
    userEvent.hover(gitFetchButton);

    await waitFor(() => {
      expect(screen.getAllByText("Fetch git branches")[0]).toBeVisible();
    });
  });

  it("should call api with correct url and mutate when git fetch button clicked", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        expect(req.url.pathname).toBe("/runner/git/fetch");

        return res(ctx.status(201));
      })
    );
    const mutate = jest.fn();
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={mutate} />);

    userEvent.click(screen.getByRole("button", { name: /git-fetch/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
  });

  it("should display fields for packet group and parameters", async () => {
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/select packet group/i)).toBeVisible();
    });
    expect(screen.getByText(/branch/i)).toBeVisible();
    expect(screen.getByText(/packet group parameters/i)).toBeVisible();
  });

  it("should show error message when form displayed with empty packet Group", async () => {
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    const runButton = screen.getByRole("button", { name: /run/i });
    userEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/packet group name is required/i)).toBeVisible();
    });
  });

  it("should show error message when form displayed with empty parameters", async () => {
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

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
    render(<PacketRunForm defaultBranch="main" branches={mockGitBranches.branches} mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: /git-fetch/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch git branches. Please try again.")).toBeVisible();
    });
  });
});
