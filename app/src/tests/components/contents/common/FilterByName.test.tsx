import { render, screen, waitFor } from "@testing-library/react";
import { FilterInput } from "../../../../app/components/contents/common/FilterInput";
import userEvent from "@testing-library/user-event";

describe("FilterByName component", () => {
  it("filtering on input & calls passed in functions", async () => {
    const setFilterByName = jest.fn();
    const postFilterAction = jest.fn();
    const placeholder = "filter by name...";
    render(<FilterInput setFilter={setFilterByName} postFilterAction={postFilterAction} placeholder={placeholder} />);

    const input = screen.getByPlaceholderText(/filter by name/i);

    userEvent.type(input, "test");

    await waitFor(() => {
      expect(setFilterByName).toHaveBeenCalledWith("test");
    });
    expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    expect(postFilterAction).toHaveBeenCalledTimes(1);
  });
});
