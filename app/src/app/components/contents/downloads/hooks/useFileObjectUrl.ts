import { useEffect, useRef, useState } from "react";
import { getFileObjectUrl } from "@lib/download";
import { FileMetadata, PacketMetadata } from "@/types";

export const useFileObjectUrl = (file: FileMetadata | undefined, packet: PacketMetadata | undefined) => {
  const [error, setError] = useState<null | Error>(null);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);
  // By using useRef, we make the latest value of fileObjectUrlRef available to the clean-up function (that which
  // revokes the object URL): for state variables, useEffect clean-up functions use the values from the previous render.
  const fileObjectUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      getFileObjectUrl(file, packet.id, file.path)
        .then((blobUrl) => {
          setFileObjectUrl(blobUrl);
          fileObjectUrlRef.current = blobUrl;
          setError(null);
        })
        .catch((e) => {
          setError(e);
        });
    }

    return () => {
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
      }
    };
  }, [file, packet]);

  return { fileObjectUrl, error };
};
