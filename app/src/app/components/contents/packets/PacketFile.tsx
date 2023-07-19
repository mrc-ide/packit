import {FileMetadata} from "../../../../types";
import React from "react";
import appConfig from "../../../../config/appConfig";

interface PacketFileProps {
    fileMetadata: FileMetadata | undefined
}

export function PacketFile({fileMetadata}: PacketFileProps) {

    const path = `packets/file/${fileMetadata?.hash}?inline=true&filename=${fileMetadata?.path}`;

    return (
        <>
            {fileMetadata && (
                <iframe
                    className="packit-iframe"
                    src={`${appConfig.apiUrl()}/${path}`}
                ></iframe>
            )}
        </>
    );
}
