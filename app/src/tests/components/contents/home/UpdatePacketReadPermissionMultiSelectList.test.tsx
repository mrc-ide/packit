import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorTrigger
} from "@components/Base/MultiSelect";
// eslint-disable-next-line max-len
import { UpdatePacketReadPermissionMultiSelectList } from "@components/contents/home/UpdatePacketReadPermissionMultiSelectList";
import { mockRolesAndUsersWithPermissions } from "@/tests/mocks";

describe("UpdatePacketReadPermissionMultiSelectList", () => {
  it("should render the list of roles and users correctly with styles", async () => {
    const rolesAndUsersArray = [...mockRolesAndUsersWithPermissions.roles, ...mockRolesAndUsersWithPermissions.users];
    render(
      <MultiSelector onValuesChange={vitest.fn()} values={[]}>
        <MultiSelectorTrigger>
          <MultiSelectorInput />
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <UpdatePacketReadPermissionMultiSelectList rolesAndUsers={mockRolesAndUsersWithPermissions} />
        </MultiSelectorContent>
      </MultiSelector>
    );

    const multiSelect = screen.getByRole("combobox");

    userEvent.click(multiSelect);
    const addUserOptions = await screen.findAllByRole("option");

    expect(addUserOptions).toHaveLength(rolesAndUsersArray.length);
    rolesAndUsersArray.forEach((roleOrUser, index) => {
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
