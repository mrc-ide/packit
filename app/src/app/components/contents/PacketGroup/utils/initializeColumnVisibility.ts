export const initializeColumnVisibility = (parameterKeys: Set<string>) => {
  const visibility: Record<string, boolean> = {};
  parameterKeys.forEach((key) => {
    visibility[`parameters_${key}`] = false; // hide all parameters by default
  });
  return visibility;
};
