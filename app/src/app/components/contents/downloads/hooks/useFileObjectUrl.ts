import { useEffect, useRef, useState } from "react";
import { getFileObjectUrl, getFileUrl } from "../../../../../lib/download";
import { FileMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";

export const useFileObjectUrl = (file: FileMetadata | undefined) => {
  const { packet } = usePacketOutletContext();

  const [error, setError] = useState<null | Error>(null);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);
  // By using useRef, we make the latest value of fileObjectUrlRef available to the clean-up function.
  const fileObjectUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (file && packet) {
      const fileUrl = getFileUrl(file, packet.id);
      getFileObjectUrl(fileUrl, file.path)
        .then((url) => {
          setFileObjectUrl(url); // Set reactive state.
          fileObjectUrlRef.current = url; // Update non-reactive ref for internal use by hook.
          setError(null);
        })
        .catch((e) => {
          setError(e); // Set error state on failure
        });
    }

    // TODO: Make sure unit tests check that the clean up function is called.
    // including those for packetreport(s).tsx!
    return () => {
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
      }
    };
  }, [file, packet]);

  // TODO: test error component for imagedisplay component
  // TODO: test error component for previewablefile component
  return { fileObjectUrl, error };
};
