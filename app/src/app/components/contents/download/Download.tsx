import {useSelector} from "react-redux";
import {FileMetadata, RootState, useAppDispatch} from "../../../../types";
import React, {useEffect} from "react";
import {actions} from "../../../store/packets/packetThunks";
import {Link, useParams} from "react-router-dom";
import {CloudDownload} from "@mui/icons-material";
import appConfig from "../../../../config/appConfig";
import {bytesToSize} from "../../../../helpers";
import {PacketHeader} from "../packets";

export default function Download()
{
    const {packet} = useSelector((state: RootState) => state.packets);

    const dispatch = useAppDispatch();

    const {packetId} = useParams();

    useEffect(() => {
        if (packetId) {
            dispatch(actions.fetchPacketById(packetId));
        }
    }, [packetId]);

    const download = (file: FileMetadata) => {
        return `${appConfig.apiUrl()}/packets/file/${file.hash}?filename=${file.path}`;
    };

    if (Object.keys(packet).length === 0) {
        return (<div>Loading...</div>);
    }

    return (
        <div className="content packet-details">
            <PacketHeader packet={packet}/>
            <ul className="list-unstyled">
                {packet.files.map((data, key) =>
                    (
                        <li key={key} className="pb-2">
                            <div className="card custom-card">
                                <div className="card-header">
                                    Download {data.path}
                                </div>
                                <div className="card-body">
                                    <Link className="card-text" to={download(data)}>
                                        <span className="p-2">{data.path}</span>
                                        <span className="sidebar-icon"><CloudDownload/></span>
                                    </Link>
                                    <span className="small p-2 text-muted">({bytesToSize(data.size)})</span>
                                </div>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}
