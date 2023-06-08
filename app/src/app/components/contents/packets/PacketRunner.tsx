import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../../types";

export default function PacketRunner() {
    const {packet, packets} = useSelector((state: RootState) => state.packets);
    const data = Object.keys(packet).length > 0 ? packet : packets[0];

    return (
        <div data-testid="packet-runner" className="content packet-runner">
            <div className="pb-3 d-flex flex-column align-items-start">
                <span className="p-2 pb-0 h1">{data.displayName}</span>
                <span className="p-2 pt-0 small">{data.id}</span>
                <span className="pt-2">
                    <span className="p-2 fw-semibold">Name:</span>
                    <span className="p-lg-4">{data.name}</span>
                </span>
                <span className="p-2 fw-semibold">Parameters </span>
                <div className="w-50">
                    {Object.entries(data.parameters).map(([key, value], index) => (
                    <div key={index} className="float-start">
                        <span className="p-2">{key}:</span>
                        <span className="badge badge-parameter">{value}</span>
                    </div>
                    ))}
                </div>
            </div>
            <div data-testid="runner-content" className="content-box">
                <p>Packet runner page</p>
            </div>
        </div>
    );
}
