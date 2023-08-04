import React from "react";
import appConfig from "../../../../config/appConfig";

interface PacketFileProps {
    path: string | null
}

export function PacketFile({path}: PacketFileProps) {

    return (
        <>
            {path && (
                <iframe
                    className="packit-iframe"
                    src={`${appConfig.apiUrl()}/${path}`}
                ></iframe>
            )}
        </>
    );
}
