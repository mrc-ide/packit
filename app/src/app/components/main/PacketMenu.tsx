import {NavLink, useParams} from "react-router-dom";
import React from "react";

export default function PacketMenu() {

    const {packetId} = useParams();

    return (
        <div className="sidebar-packet-list">
            <ul className="list-unstyled">
                <li>
                    <NavLink to={`/packets/${packetId}/`}>
                        <span>Packet</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/metadata`}>
                        <span>Metadata</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/downloads`}>
                        <span>Downloads</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/packets/${packetId}/changelogs`}>
                        <span>Changelogs</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}
