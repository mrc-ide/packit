import { FilterFn } from "@tanstack/react-table";
import { BasicRoleWithUsers, RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithPermissions } from "../types/UserWithPermissions";

export const rolesGlobalFilterFn: FilterFn<BasicRoleWithUsers | RoleWithRelationships> = (
  row,
  columnId,
  filterValue
) => {
  const rowValue = row.getValue(columnId);
  if (typeof rowValue === "string") {
    return rowValue.toLowerCase().includes(filterValue.toLowerCase());
  }
  // users column
  if (Array.isArray(rowValue)) {
    return rowValue.some((user) => user?.username.toLowerCase().includes(filterValue.toLowerCase()));
  }
  return false;
};

export const usersGlobalFilterFn: FilterFn<UserWithPermissions> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId);
  if (typeof rowValue === "string") {
    return rowValue.toLowerCase().includes(filterValue.toLowerCase());
  }
  // roles column
  if (Array.isArray(rowValue)) {
    return rowValue.some((role) => role?.name.toLowerCase().includes(filterValue.toLowerCase()));
  }
  return false;
};
