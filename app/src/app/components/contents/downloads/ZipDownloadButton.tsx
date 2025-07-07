import { download } from "@lib/download";
import { Button, buttonVariants } from "../../Base/Button";
import { FolderDown, Loader2 } from "lucide-react";
import { FileMetadata } from "@/types";
import { useState } from "react";
import { filesToSize } from "@/helpers";
import type { VariantProps } from "class-variance-authority";

interface ZipDownloadButtonProps {
  files: FileMetadata[];
  zipName: string;
  packetId: string;
  buttonText?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

export const ZipDownloadButton = ({
  files,
  zipName,
  packetId,
  buttonText = "Download",
  variant = "default",
  className,
  containerClassName,
  disabled
}: ZipDownloadButtonProps) => {
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const text = disabled ? buttonText : `${buttonText} (${filesToSize(files)})`;

  const downloadFiles = async () => {
    if (!packetId || files.length < 1) {
      return;
    }
    setDownloading(true);
    setError("");
    await download(files, packetId, zipName, true)
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  return (
    <div className={`flex flex-col items-end gap-1 ${containerClassName}`} data-testid="zip-download-button">
      <Button
        onClick={downloadFiles}
        variant={variant}
        className={`px-3 h-fit ${className}`}
        disabled={disabled || downloading}
      >
        {downloading && <Loader2 size={18} className="animate-spin" />}
        {!downloading && <FolderDown size={18} />}
        <span className="ps-1.5">{text}</span>
      </Button>
      <div className="text-red-500 text-right">{error}</div>
    </div>
  );
};
