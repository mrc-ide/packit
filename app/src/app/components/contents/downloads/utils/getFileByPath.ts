import { PacketMetadata } from "@/types";

export const getFileByPath = (path: string, packet: PacketMetadata | undefined) => {
  return packet?.files.find((file) => file.path === path.replace("//", "/"));
};
