import {FileMetadata, RootState} from "../../../../types";
import {useState} from "react";
import appConfig from "../../../../config/appConfig";
import {download} from "../../../../lib/download";
import {Button} from "../../Base/Button";
import {DownloadCloud} from "lucide-react";
import {bytesToSize} from "../../../../helpers";
import {useSelector} from "react-redux";

interface DownloadButtonProps {
    file: FileMetadata
}

export default function DownloadButton({ file }: DownloadButtonProps) {
    const [error, setError] = useState("");
    const { isAuthenticated } = useSelector((state: RootState) => state.login );

    const downloadFile = (file: FileMetadata) => {
        const url = `${appConfig.apiUrl()}/packets/file/${file.hash}?filename=${file.path}`;
        download(url, file.path, isAuthenticated)
            .then(() => setError(""))
            .catch(e =>  {
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
            <div className="text-red-500 h-6">{error}</div>
        </>
    );
}
