import { render } from "@testing-library/react";
import { ManageRoles } from "../../../../app/components/contents/manageAccess";

describe("ManageRoles", () => {
  it("renders", () => {
    render(<ManageRoles />);
  });
});
