import { FilterFn } from "@tanstack/react-table";
import { RoleWithRelationships } from "../types/RoleWithRelationships";

export const rolesGlobalFilterFn: FilterFn<RoleWithRelationships> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId);
  // name column
  if (typeof rowValue === "string") {
    return rowValue.toLowerCase().includes(filterValue.toLowerCase());
  }
  // users column
  if (Array.isArray(rowValue)) {
    return rowValue.some((user) => user?.username.toLowerCase().includes(filterValue.toLowerCase()));
  }
  return false;
};
