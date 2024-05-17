import { render } from "@testing-library/react";
import { ManageUsers } from "../../../../app/components/contents/manageAccess";

describe("ManageUsers", () => {
  it("renders", () => {
    render(<ManageUsers />);
  });
});
