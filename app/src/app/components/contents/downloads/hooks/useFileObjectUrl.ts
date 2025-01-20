import { useEffect, useState } from "react";
import { getFileObjectUrl, getFileUrl } from "../../../../../lib/download";
import { FileMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";

export const useFileObjectUrl = (file: FileMetadata | undefined) => {
  const { packet } = usePacketOutletContext();

  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      const fileUrl = getFileUrl(file, packet.id);
      getFileObjectUrl(fileUrl, file.path).then(setFileObjectUrl);
    }

    // TODO: Make sure unit tests check that the clean up function is called.
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [file, packet]);

  return fileObjectUrl;
};
