export const getPermissionScopePaths = (filterName: string) => {
  const filter = filterName.split(":");
  return {
    global: null,
    packet: `packets?filterName=${filter[0]}&filterId=${filter[1] || ""}`,
    tag: `tag?filterName=${filter[0]}`,
    packetGroup: `packetGroups?filterName=${filter[0]}`
  };
};
