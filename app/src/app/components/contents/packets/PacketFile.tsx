import {FileMetadata} from "../../../../types";
import React from "react";
import appConfig from "../../../../config/appConfig";

interface PacketFile {
    fileMetadata: FileMetadata | undefined
}

export function PacketFile({fileMetadata}: PacketFile) {

    if (!fileMetadata) {
        return (
            <div>Unsupported file format, unable to display the file.</div>
        );
    }

    return (
        <iframe className="packit-iframe"
                src={`${appConfig.apiUrl()}/packets/file/${fileMetadata?.hash}`}>
        </iframe>
    );
}
