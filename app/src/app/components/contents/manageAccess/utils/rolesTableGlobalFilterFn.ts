import { FilterFn } from "@tanstack/react-table";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

export const rolesGlobalFilterFn: FilterFn<RoleWithRelationships> = (row, columnId, filterValue) => {
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

export const usersGlobalFilterFn: FilterFn<UserWithRoles> = (row, columnId, filterValue) => {
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
