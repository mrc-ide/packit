import {FileMetadata} from "../../../../types";
import {useState} from "react";
import appConfig from "../../../../config/appConfig";
import {download} from "../../../../lib/download";
import {Button} from "../../Base/Button";
import {DownloadCloud} from "lucide-react";
import {bytesToSize} from "../../../../helpers";

interface DownloadButtonProps {
    file: FileMetadata
}

export default function DownloadButton({ file }: DownloadButtonProps) {
    const [error, setError] = useState("");

    const downloadFile = (file: FileMetadata) => {
        const url = `${appConfig.apiUrl()}/packets/file/${file.hash}?filename=${file.path}`;
        download(url, file.path)
            .then(() => setError("ok now"))
            .catch(e =>  {
                console.log("ERROR")
                console.log(JSON.stringify(e.message))
                setError(e.message);
            });
    };

    return (
        <>
            <Button onClick={() => downloadFile(file)} variant="outline">
                {file.path}
                <span className="sidebar-icon p-2">
                        <DownloadCloud />
                      </span>
            </Button>
            <span className="small p-2 text-muted">({bytesToSize(file.size)})</span>
            <div className="text-red-500 h-4">{error}</div>
        </>
    );
}