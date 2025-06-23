import { Artefact, FileMetadata, PacketMetadata } from "../../../../../types";
import { getFileByPath } from "./getFileByPath";

export const filesForArtefact = (artefact: Artefact, packet: PacketMetadata) =>
  artefact.paths.map((path) => getFileByPath(path, packet)).filter((file): file is FileMetadata => !!file);

export const allArtefactsFilesForPacket = (packet: PacketMetadata) => {
  return packet.custom?.orderly.artefacts.flatMap((art): FileMetadata[] => {
    return filesForArtefact(art, packet);
  });
};
