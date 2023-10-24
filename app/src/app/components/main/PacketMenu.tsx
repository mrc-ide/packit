import {NavLink, useParams} from "react-router-dom";
import React from "react";

export default function PacketMenu() {

    const {packetId} = useParams();

    return (
        <div data-testid="packet-menu" className="sidebar-packet-menu">
            <ul className="list-unstyled">
                <li>
                    <NavLink to={`/packets/${packetId}/packet`}>
                        <span className="text">Packet</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/metadata`}>
                        <span className="text">Metadata</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/downloads`}>
                        <span className="text">Downloads</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/changelogs`}>
                        <span className="text">Changelogs</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}
