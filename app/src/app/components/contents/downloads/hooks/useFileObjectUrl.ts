import { useEffect, useRef, useState } from "react";
import { getFileObjectUrl, getFileUrl } from "../../../../../lib/download";
import { FileMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { filePathToExtension } from "../utils/extensions";

export const useFileObjectUrl = (file: FileMetadata | undefined) => {
  const { packet } = usePacketOutletContext();

  const [error, setError] = useState<null | Error>(null);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);
  // By using useRef, we make the latest value of fileObjectUrlRef available to the clean-up function (that which
  // revokes the object URL): for state variables, useEffect clean-up functions use the values from the previous render.
  const fileObjectUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      const extension = filePathToExtension(file?.path);
      const fileUrl = getFileUrl(file, packet.id, extension === "html");
      getFileObjectUrl(fileUrl, file.path)
        .then((url) => {
          setFileObjectUrl(url);
          fileObjectUrlRef.current = url;
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
