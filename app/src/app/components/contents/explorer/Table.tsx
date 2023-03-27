import React from "react";
import {PacketTable} from "../../../types";

export default function Table({data, headers}: PacketTable) {
    return (
        <>
            <thead>
            <tr>
                {headers.map(({label, accessor, sortable}) => (
                    <th key={accessor}
                        onClick={() => sortable ? console.log("We shall implement sort by", accessor) : null}>
                        <span className="m-4">{label}</span>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((packet, key) => (
                <tr key={key}>
                    <td>
                        <span>
                            <a href="#">{packet.displayName ? packet.displayName : packet.name}</a>
                        </span>
                    </td>
                    <td>
                        <span>{packet.id}</span>
                    </td>
                    <td>
                        <span className={`badge ${packet.published ? "badge-published" : "badge-internal"}`}>
                                {packet.published ? "published" : "internal"}
                        </span>
                    </td>
                    <td>
                        <span>
                            {Object.entries(packet.parameters).map(([key, value]) => (
                                <ul key={key} className="list-unstyled ">
                                    <li className="justify-content-evenly" key={key}>{key}={value}</li>
                                </ul>
                            ))}
                        </span>
                    </td>
                </tr>
            ))}
            </tbody>
        </>
    );
}
