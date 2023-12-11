import { PacketMetadata } from "../../../../../types";

export const getHashOfHtmlFileIfExists = (packet: PacketMetadata) =>
  packet.files.length > 0 ? packet.files.find((file) => file.path.split(".").pop() === "html") : null;

export const getHtmlFilePath = (packet: PacketMetadata) =>
  getHashOfHtmlFileIfExists(packet)
    ? `packets/file/${getHashOfHtmlFileIfExists(packet)?.hash}?inline=true&filename=${getHashOfHtmlFileIfExists(packet)
        ?.path}`
    : null;
