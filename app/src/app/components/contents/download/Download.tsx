import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../types";
import React, {useEffect} from "react";
import {actions} from "../../../store/packets/thunks";
import {useParams} from "react-router-dom";
import {CloudDownload} from "@mui/icons-material";

export default function Download()
{
    const {packet} = useSelector((state: RootState) => state.packets);

    const dispatch = useAppDispatch();

    const {packetId} = useParams();

    useEffect(() => {
        if (packetId) {
            dispatch(actions.fetchPacketMetadataById(packetId));
        }
    }, [packetId]);

    if (Object.keys(packet).length === 0) {
        return (<div>Loading...</div>);
    }

    return (
        <div>
            <ul>
                {packet.files.map((data, key) => {
                    return (
                        <li className="list-unstyled"
                            key={key} onClick={() => dispatch(actions.fetchFileByHash(data.hash))}>
                            <span className="p-4"><a href="#">{data.hash}</a></span>
                            <span className="sidebar-icon"><CloudDownload /></span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
