import {
  rolesGlobalFilterFn,
  usersGlobalFilterFn
} from "../../../../../app/components/contents/manageAccess/utils/rolesTableGlobalFilterFn";

describe("rolesTableGlobalFilterFn", () => {
  const row = {
    getValue: jest.fn()
  } as any;
  describe("rolesGlobalFilterFn", () => {
    it("should return true if rowValue is a string and includes filterValue", () => {
      row.getValue.mockReturnValueOnce("testRole");
      const columnId = "name";
      const filterValue = "test";

      const result = rolesGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(true);
      expect(row.getValue).toHaveBeenCalledWith(columnId);
    });

    it("should return true if rowValue is an array of users and includes filterValue", () => {
      row.getValue.mockReturnValueOnce([{ username: "testUser" }, { username: "otherUser" }]);
      const columnId = "users";
      const filterValue = "test";

      const result = rolesGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(true);
    });

    it("should return false if rowValue is string and does not include filterValue", () => {
      row.getValue.mockReturnValueOnce("testRole");
      const columnId = "name";
      const filterValue = "other";

      const result = rolesGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });

    it("should return false if rowValue is an array of users and does not include filterValue", () => {
      row.getValue.mockReturnValueOnce([{ username: "testUser" }, { username: "otherUser" }]);
      const columnId = "users";
      const filterValue = "notFound";

      const result = rolesGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });
    it("should return false if rowValue is not a string or an array", () => {
      row.getValue.mockReturnValueOnce(123);
      const columnId = "name";
      const filterValue = "test";

      const result = rolesGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });
  });

  describe("usersGlobalFilterFn", () => {
    it("should return true if rowValue is a string and includes filterValue", () => {
      row.getValue.mockReturnValueOnce("testUser");
      const columnId = "username";
      const filterValue = "test";

      const result = usersGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(true);
    });

    it("should return true if rowValue is an array of roles and includes filterValue", () => {
      row.getValue.mockReturnValueOnce([{ name: "testRole" }, { name: "otherRole" }]);
      const columnId = "roles";
      const filterValue = "test";

      const result = usersGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(true);
    });

    it("should return false if rowValue is string and does not include filterValue", () => {
      row.getValue.mockReturnValueOnce("testUser");
      const columnId = "username";
      const filterValue = "other";

      const result = usersGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });

    it("should return false if rowValue is an array of roles and does not include filterValue", () => {
      row.getValue.mockReturnValueOnce([{ name: "testRole" }, { name: "otherRole" }]);
      const columnId = "roles";
      const filterValue = "notFound";

      const result = usersGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });

    it("should return false if rowValue is not a string or an array", () => {
      row.getValue.mockReturnValueOnce(123);
      const columnId = "username";
      const filterValue = "test";

      const result = usersGlobalFilterFn(row, columnId, filterValue, jest.fn());

      expect(result).toBe(false);
    });
  });
});
