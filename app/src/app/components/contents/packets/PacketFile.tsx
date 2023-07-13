import {FileMetadata} from "../../../../types";
import React from "react";
import appConfig from "../../../../config/appConfig";

interface PacketFileProps {
    fileMetadata: FileMetadata | undefined
}
export function PacketFile({ fileMetadata }: PacketFileProps) {
    return (
        <>
            {fileMetadata && (
                <iframe
                    className="packit-iframe"
                    src={`${appConfig.apiUrl()}/packets/file/${fileMetadata?.hash}`}
                ></iframe>
            )}
        </>
    );
}
