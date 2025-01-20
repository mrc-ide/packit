export const parseNameFromQuery = (queryString: string): string => {
  const pattern = /name == "([^"]+)"/;
  const match = queryString.match(pattern);
  return match ? match[1] : "";
};
