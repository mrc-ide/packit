import React from "react";
import {PacketTable} from "../../../types";

export default function Table({data, headers}: PacketTable) {
    return (
        <>
            <thead>
            <tr>
                {headers.map(({label, accessor, sortable}) => (
                    <th key={accessor}
                        onClick={() => sortable
                        ? console.log("Sort by", accessor)
                        : null}>
                        <span className="m-4">{label}</span>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((packet, key) => (
                <tr key={key}>
                    <td>{packet.name}</td>
                    <td>{packet.displayName}</td>
                    <td>{packet.published.toString()}</td>
                    <td>{packet.parameters}</td>
                </tr>
            ))}
            </tbody>
        </>
    );
}
