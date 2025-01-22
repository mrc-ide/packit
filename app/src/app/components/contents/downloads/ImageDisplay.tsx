import { FileMetadata } from "../../../../types";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { ErrorComponent } from "../common/ErrorComponent";

const defaultErrorMessage = "Error loading image file";

interface ImageDisplayProps {
  file: FileMetadata;
}

export const ImageDisplay = ({ file }: ImageDisplayProps) => {
  const { fileObjectUrl, error } = useFileObjectUrl(file);

  if (error) return <ErrorComponent message={defaultErrorMessage} error={error} />;

  return fileObjectUrl ? <img src={fileObjectUrl} alt={file.path} /> : null;
};
