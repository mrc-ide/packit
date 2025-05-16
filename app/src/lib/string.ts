export const kebabToSentenceCase = (input: string): string => {
  if (input.includes("-")) {
    return input.replace(/-/g, " ");
  }
  return input;
};
