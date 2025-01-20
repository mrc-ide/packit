import { PacketMetadata } from "../../../../../types";

export const getHtmlFileIfExists = (packet: PacketMetadata) =>
  packet.files.find((file) => file.path.split(".").pop() === "html") || undefined;
