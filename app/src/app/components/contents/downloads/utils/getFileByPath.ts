import { PacketMetadata } from "../../../../../types";

export const getFileByPath = (path: string, packet: PacketMetadata) => {
  return packet?.files.filter((file) => file.path === path.replace("//", "/"))[0];
};
