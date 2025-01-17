import { useEffect, useState } from "react";
import { getFileObjectUrl, getFileUrl } from "../../../../../lib/download";
import { FileMetadata, PacketMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";

export const useFileObjectUrl = (file: FileMetadata | undefined) => {
  const { packet } = usePacketOutletContext();

  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      const fileUrl = getFileUrl(file, packet.id);
      getFileObjectUrl(fileUrl, file.path).then(setFileObjectUrl);
    }
  }, [file, packet]);

  return fileObjectUrl;
};
