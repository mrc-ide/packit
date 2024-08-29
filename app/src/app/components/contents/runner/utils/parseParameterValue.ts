export const parseParameterValue = (value: any): string | number | boolean | null => {
  if (typeof value !== "string") {
    return value;
  }

  switch (true) {
    case value === "" || value === "null":
      return null;
    case value.toLocaleLowerCase() === "true":
      return true;
    case value.toLocaleLowerCase() === "false":
      return false;
    case !isNaN(Number(value)):
      return Number(value);
    default:
      return value;
  }
};
