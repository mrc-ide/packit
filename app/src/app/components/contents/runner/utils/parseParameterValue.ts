export const parseParameterValue = (value: string): string | number | boolean | null => {
  switch (true) {
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
