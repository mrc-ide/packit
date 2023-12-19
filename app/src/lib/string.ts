export const getInitials = (name: string) => {
  const trimmedName = name.trim();
  if (trimmedName === "") {
    throw new Error("Name cannot be empty");
  }

  const [firstName, lastName] = trimmedName.split(" ");
  if (!firstName || !lastName) {
    throw new Error("Invalid name format");
  }

  return `${firstName[0]}${lastName[0]}`;
};
