import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../../../../app/components/contents/common/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { FilterInput } from "../../../../app/components/contents/common/FilterInput";
import { useState } from "react";

describe("DataTable", () => {
  const data = Array.from({ length: 30 }, (_, i) => ({ name: `Name ${i}`, age: i }));
  const columnHelper = createColumnHelper<{ name: string; age: number }>();
  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => {
        return (
          <div>
            <FilterInput
              setFilter={column.setFilterValue}
              placeholder="Search..."
              inputClassNames="h-8 sm:w-32 lg:w-40"
            />
            Name
          </div>
        );
      }
    }),
    columnHelper.accessor("age", {
      header: ({ column }) => {
        return <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Age</button>;
      }
    })
  ];

  it("should render table with data", () => {
    render(<DataTable data={data.slice(0, 10)} columns={columns} />);

    expect(screen.getByText("Name 0")).toBeVisible();
  });

  it("should render table without data", () => {
    render(<DataTable data={[]} columns={columns} />);

    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("should render table with pagination correctly", () => {
    render(<DataTable data={data} columns={columns} pagination={{ pageSize: 10 }} />);

    expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
    expect(screen.getByText("Name 0")).toBeVisible();
    expect(screen.queryByText("Name 15")).not.toBeInTheDocument();
  });

  it("should have working pagination controls", () => {
    render(<DataTable data={data} columns={columns} pagination={{ pageSize: 10 }} />);

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

  it("should be able to sort data", async () => {
    render(<DataTable data={data} columns={columns} />);

    // sort asc
    userEvent.click(screen.getByRole("button", { name: /age/i }));
    expect(screen.getAllByRole("cell")[1].textContent).toBe("0");

    // sort desc
    userEvent.click(screen.getByRole("button", { name: /age/i }));
    expect(screen.getAllByRole("cell")[1].textContent).toBe("29");
  });

  it("should be able to filter data", async () => {
    render(<DataTable data={data} columns={columns} clientFiltering />);

    userEvent.type(screen.getByPlaceholderText("Search..."), "Name 1");

    await waitFor(() => {
      expect(screen.getByText("Name 1")).toBeVisible();
      expect(screen.queryByText("Name 0")).not.toBeInTheDocument();
    });
  });

  it("should be able to toggle visibility of columns", async () => {
    const VisibilityComponent = () => {
      const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        name: true,
        age: true
      });
      return (
        <div>
          <div>
            {/* toggle name column off */}
            <button onClick={() => setColumnVisibility((prev) => ({ ...prev, name: !prev.name }))}>toggle</button>
          </div>
          <DataTable data={data} columns={columns} visibility={{ columnVisibility, setColumnVisibility }} />;
        </div>
      );
    };
    render(<VisibilityComponent />);

    expect(screen.getByText("Name")).toBeVisible();

    const toggle = screen.getByRole("button", { name: /toggle/i });

    userEvent.click(toggle);
    await waitFor(() => {
      expect(screen.queryByText("Name")).not.toBeInTheDocument();
    });

    userEvent.click(toggle);
    await waitFor(() => {
      expect(screen.getByText("Name")).toBeVisible();
    });
  });
});
