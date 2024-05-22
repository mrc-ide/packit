import { render, screen, waitFor } from "@testing-library/react";
import { FilterByName } from "../../../../app/components/contents/common/FilterByName";
import userEvent from "@testing-library/user-event";

describe("FilterByName component", () => {
  it("filtering on input & calls passed in functions", async () => {
    const setFilterByName = jest.fn();
    const setPageNumber = jest.fn();
    render(<FilterByName setFilterByName={setFilterByName} setPageNumber={setPageNumber} />);

    const input = screen.getByPlaceholderText(/filter by name/i);

    userEvent.type(input, "test");

    await waitFor(() => {
      expect(setFilterByName).toHaveBeenCalledWith("test");
    });

    expect(setPageNumber).toHaveBeenCalledWith(0);
  });
});
