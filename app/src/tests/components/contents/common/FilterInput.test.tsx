import { render, screen, waitFor } from "@testing-library/react";
import { FilterInput } from "../../../../app/components/contents/common/FilterInput";
import userEvent from "@testing-library/user-event";

describe("FilterInput component", () => {
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

  it("should add classnames to input if passed in", async () => {
    render(
      <FilterInput
        setFilter={jest.fn()}
        postFilterAction={jest.fn()}
        placeholder={"placeholder"}
        inputClassNames="sm:w-[1000px] h-14"
      />
    );

    const input = screen.getByPlaceholderText(/placeholder/i);
    expect(input).toHaveClass("sm:w-[1000px]");
    expect(input).toHaveClass("h-14");
  });
});
