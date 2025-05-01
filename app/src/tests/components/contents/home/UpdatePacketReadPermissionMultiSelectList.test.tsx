import { render, screen } from "@testing-library/react";
// eslint-disable-next-line max-len
import { UpdatePacketReadPermissionMultiSelectList } from "../../../../app/components/contents/home/UpdatePacketReadPermissionMultiSelectList";
import { UserWithRoles } from "../../../../app/components/contents/manageAccess/types/UserWithRoles";
import { RoleWithRelationships } from "../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorTrigger
} from "../../../../app/components/Base/MultiSelect";
import userEvent from "@testing-library/user-event";

describe("UpdatePacketReadPermissionMultiSelectList", () => {
  it("should render the list of roles and users correctly with styles", async () => {
    const rolesAndUsers = [
      { id: "1", name: "Admin" },
      { id: "3", name: "Guest" },
      { id: "2", username: "x@gmail.com" },
      { id: "4", username: "aa@gmail.com" }
    ] as unknown as (RoleWithRelationships | UserWithRoles)[];
    render(
      <MultiSelector onValuesChange={jest.fn()} values={[]}>
        <MultiSelectorTrigger>
          <MultiSelectorInput />
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <UpdatePacketReadPermissionMultiSelectList rolesAndUsers={rolesAndUsers} />
        </MultiSelectorContent>
      </MultiSelector>
    );

    const multiSelect = screen.getByRole("combobox");

    userEvent.click(multiSelect);
    const addUserOptions = await screen.findAllByRole("option");

    expect(addUserOptions).toHaveLength(4);
    rolesAndUsers.forEach((roleOrUser, index) => {
      if ("name" in roleOrUser) {
        expect(addUserOptions[index]).toHaveTextContent(roleOrUser.name + "Role");
        expect(addUserOptions[index]).toHaveClass("text-[#7B341E] dark:text-[#FBD38D]");
      } else {
        expect(addUserOptions[index]).toHaveTextContent(roleOrUser.username + "User");
        expect(addUserOptions[index]).toHaveClass("text-[#2C5282] dark:text-[#90CDF4]");
      }
    });
  });
});
