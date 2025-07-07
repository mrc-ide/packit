import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToggleParamColumnsDropdownColumns } from "@components/contents/PacketGroup/ToggleParamColumnsDropdown";
import userEvent from "@testing-library/user-event";

describe("ToggleParamColumnsDropdown", () => {
  const DOWN_ARROW = { keyCode: 40 };
  const allParammetersKeys = new Set(["key1", "key2"]);
  const visibility = {
    parameters_key1: true,
    parameters_key2: false
  };
  it("should render dropdown with all parameter keys, with checks for visible", async () => {
    render(
      <ToggleParamColumnsDropdownColumns
        columnVisibility={visibility}
        allParametersKeys={allParammetersKeys}
        setColumnVisibility={vitest.fn()}
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /parameter columns/i }), DOWN_ARROW);

    await waitFor(() => {
      expect(screen.getByRole("menuitemcheckbox", { name: /key1/i })).toBeChecked();
      expect(screen.getByRole("menuitemcheckbox", { name: /key2/i })).not.toBeChecked();
    });
  });

  it("should call setColumnVisibility with correct value when all parameter columns selected", async () => {
    const setColumnVisibility = vitest.fn();
    const mockPrevState = {
      parameters_key1: true,
      parameters_key2: false
    };
    render(
      <ToggleParamColumnsDropdownColumns
        columnVisibility={visibility}
        allParametersKeys={allParammetersKeys}
        setColumnVisibility={setColumnVisibility}
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /parameter columns/i }), DOWN_ARROW);

    const menuItem = await screen.findByRole("menuitemcheckbox", { name: /key2/i });

    userEvent.click(menuItem);

    expect(setColumnVisibility).toHaveBeenCalledTimes(1);
    const updateFunction = setColumnVisibility.mock.calls[0][0];
    const newState = updateFunction(mockPrevState);

    expect(newState).toEqual({
      parameters_key1: true,
      parameters_key2: true,
      parameters: false
    });
  });

  it("should call setColumnVisibility with correct value when any parameter unselected", async () => {
    const setColumnVisibility = vitest.fn();
    const mockPrevState = {
      parameters_key1: true,
      parameters_key2: true
    };
    render(
      <ToggleParamColumnsDropdownColumns
        columnVisibility={mockPrevState}
        allParametersKeys={allParammetersKeys}
        setColumnVisibility={setColumnVisibility}
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /parameter columns/i }), DOWN_ARROW);

    const menuItem = await screen.findByRole("menuitemcheckbox", { name: /key2/i });

    userEvent.click(menuItem);

    expect(setColumnVisibility).toHaveBeenCalledTimes(1);
    const updateFunction = setColumnVisibility.mock.calls[0][0];
    const newState = updateFunction(mockPrevState);

    expect(newState).toEqual({
      parameters_key1: true,
      parameters_key2: false,
      parameters: true
    });
  });
});
