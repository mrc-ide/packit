import { PacketMetadata } from "../../../../../types";

export const getHtmlFileIfExists = (packet: PacketMetadata) =>
  packet.files.find((file) => file.path.split(".").pop() === "html") || null;

export const getHtmlFilePath = (packet: PacketMetadata) => {
  const file = getHtmlFileIfExists(packet);
  return file ? `packets/file/${packet.id}?hash=${file.hash}?inline=true&filename=${file.path}` : null;
};
