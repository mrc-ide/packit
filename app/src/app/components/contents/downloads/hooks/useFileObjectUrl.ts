import { useEffect, useState } from "react";
import { getFileObjectUrl, getFileUrl } from "../../../../../lib/download";
import { FileMetadata, PacketMetadata } from "../../../../../types";

export const useFileObjectUrl = (packet: PacketMetadata | undefined, file: FileMetadata | undefined) => {
  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      const fileUrl = getFileUrl(file, packet.id);
      getFileObjectUrl(fileUrl, file.path).then(setFileObjectUrl);
    }
  }, [file, packet]);

  return fileObjectUrl;
};
