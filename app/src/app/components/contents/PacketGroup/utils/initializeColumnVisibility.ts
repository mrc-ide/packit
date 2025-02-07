export const initializeColumnVisibility = (parameterKeys: Set<string>) => {
  const visibility: Record<string, boolean> = { parameters: true }; // show parameters column by default
  parameterKeys.forEach((key) => {
    visibility[`parameters_${key}`] = false; // hide all individual parameters by default
  });
  return visibility;
};
