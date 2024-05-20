export const getInitials = (name = "X X") => {
  const trimmedName = name.trim();
  if (trimmedName === "") {
    return "XX";
  }

  const [firstName, lastName] = trimmedName.split(" ");
  if (!firstName || !lastName) {
    return "XX";
  }

  return `${firstName[0]}${lastName[0]}`;
};

export const kebabToSentenceCase = (input: string): string => {
  if (input.includes("-")) {
    return input.replace(/-/g, " ");
  }
  return input;
};
