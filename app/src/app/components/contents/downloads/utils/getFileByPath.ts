import { PacketMetadata } from "../../../../../types";

export const getFileByPath = (path: string, packet: PacketMetadata) => {
  return packet.files.find((file) => file.path === path.replace("//", "/"));
};
