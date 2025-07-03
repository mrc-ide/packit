import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../../../../app/components/contents/common/Pagination";

describe("Pagination test", () => {
  it("correctly navigates to all pages", () => {
    const setPageNumber = vitest.fn();
    render(
      <Pagination
        currentPageNumber={2}
        totalPages={5}
        isFirstPage={false}
        isLastPage={false}
        setPageNumber={setPageNumber}
      />
    );

    expect(screen.getByText(/page 3 of 5/i)).toBeVisible();

    userEvent.click(screen.getByRole("button", { name: /back-to-first-page/i }));
    expect(setPageNumber).toHaveBeenCalledWith(0);
    userEvent.click(screen.getByRole("button", { name: /back-to-previous-page/i }));
    expect(setPageNumber).toHaveBeenCalledWith(1);
    userEvent.click(screen.getByRole("button", { name: /go-to-next-page/i }));
    expect(setPageNumber).toHaveBeenCalledWith(3);
    userEvent.click(screen.getByRole("button", { name: /go-to-last-page/i }));
    expect(setPageNumber).toHaveBeenCalledWith(4);
  });

  it("should disable buttons when on first and last page", () => {
    const setPageNumber = vitest.fn();
    render(
      <Pagination
        currentPageNumber={0}
        totalPages={5}
        isFirstPage={true}
        isLastPage={false}
        setPageNumber={setPageNumber}
      />
    );

    expect(screen.getByText(/page 1 of 5/i)).toBeVisible();

    expect(screen.getByRole("button", { name: /back-to-first-page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /back-to-previous-page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /go-to-next-page/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /go-to-last-page/i })).toBeEnabled();
  });
});
