import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../../../../app/components/contents/common/DataTable";

describe("DataTable", () => {
  const data = Array.from({ length: 150 }, (_, i) => ({ name: `Name ${i}`, age: i }));
  const columns = [
    {
      accessorKey: "name"
    },
    {
      accessorKey: "age"
    }
  ];

  it("should render table with data", () => {
    render(<DataTable data={data.slice(0, 10)} columns={columns} enablePagination={false} />);

    expect(screen.getByText("Name 0")).toBeVisible();
  });

  it("should render table without data", () => {
    render(<DataTable data={[]} columns={columns} enablePagination={false} />);

    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("should render table with pagination correctly", () => {
    render(<DataTable data={data} columns={columns} enablePagination={true} />);

    expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
    expect(screen.getByText("Name 0")).toBeVisible();
    expect(screen.queryByText("Name 60")).not.toBeInTheDocument();
  });

  it("should have working pagination controls", () => {
    render(<DataTable data={data} columns={columns} enablePagination={true} />);

    // first page cant go back
    expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /back-to-first-page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /back-to-previous-page/i })).toBeDisabled();

    userEvent.click(screen.getByRole("button", { name: /go-to-next-page/i }));
    // second page can go back and forth
    expect(screen.getByText(/page 2 of 3/i)).toBeVisible();
    screen.getAllByRole("button").forEach((button) => expect(button).not.toBeDisabled());

    userEvent.click(screen.getByRole("button", { name: /go-to-last-page/i }));
    // last page cant go forward
    expect(screen.getByRole("button", { name: /go-to-last-page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /go-to-next-page/i })).toBeDisabled();

    userEvent.click(screen.getByRole("button", { name: /back-to-first-page/i }));
    // back to first page
    expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
  });
});
