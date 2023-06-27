import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../types";
import ParameterList from "./ParameterList";
import {useParams} from "react-router-dom";
import {actions} from "../../../store/packets/thunks";

export default function PacketDetails() {

    const dispatch = useAppDispatch();

    const {packetId} = useParams();

    useEffect(() => {
        if (packetId) {
            dispatch(actions.fetchPacketById(packetId));
        }
    }, [packetId]);

    const {packet, packetError} = useSelector((state: RootState) => state.packets);

    const hasParameters = (): boolean => {
        return Object.entries(packet.parameters).length > 0;
    };

    if (packetError) {
        return <div>{packetError.error.detail}</div>;
    }

    if (!packetError && Object.keys(packet).length === 0) {
        return (<div>Loading...</div>);
    }

    return (
        <div data-testid="packet-runner" className="content packet-details">
            <div className="pb-3 d-flex flex-column align-items-start">
                <span className="p-2 pb-0 h1">{packet.displayName}</span>
                <span className="p-2 pt-0 small">{packet.id}</span>
                <span className="pt-2">
                    <span className="p-2 fw-semibold">Name:</span>
                    <span className="p-lg-4">{packet.name}</span>
                </span>
                {hasParameters() && <ParameterList parameters={packet.parameters}/>}
            </div>
            <div data-testid="runner-content" className="content-box">
                <p>content</p>
            </div>
        </div>
    );
}
