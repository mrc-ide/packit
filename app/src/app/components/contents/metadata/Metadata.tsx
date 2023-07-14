import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../types";
import {useParams} from "react-router-dom";
import {actions} from "../../../store/packets/thunks";
import {PacketHeader} from "../packets";
import {getDateUTCString, getElapsedTime} from "../../../../helpers";

export default function Metadata() {

    const {packet} = useSelector((state: RootState) => state.packets);

    const dispatch = useAppDispatch();

    const {packetId} = useParams();

    useEffect(() => {
        if (packetId) {
            dispatch(actions.fetchPacketById(packetId));
        }
    }, [packetId]);

    return (
        <div className="content packet-details">
            <PacketHeader packet={packet}/>
            <div className="w-75">
                <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        {getDateUTCString(packet.time) && (<div className="align-content-start p-2">
                            <span className="col3 p-2">Started:</span>
                            <span className="text-muted small">{getDateUTCString(packet.time)}</span>
                        </div>)}
                        {getElapsedTime(packet.time) && (<div className="align-content-end p-2">
                            <span className="col3 p-2">Elapsed:</span>
                            <span className="text-muted small">{getElapsedTime(packet.time)}</span>
                        </div>)}
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        {packet.git?.branch && (<div className="align-content-start p-2">
                            <span className="col3 p-2">Git Branch:</span>
                            <span className="text-muted small">{packet.git?.branch}</span>
                        </div>)}
                        {packet.git?.sha && (<div className="align-content-start p-2">
                            <span className="col3 p-2">Git Commit:</span>
                            <span className="text-muted small">{packet.git?.sha}</span>
                        </div>)}
                    </li>
                </ul>
            </div>

        </div>
    );
}
