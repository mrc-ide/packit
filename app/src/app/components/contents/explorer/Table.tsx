import React from "react";
import {Header, PacketTableProps} from "../../../../types";

export default function Table({data}: PacketTableProps) {
    const headers: Header[] = [
        {label: "Name", accessor: "name", sortable: true},
        {label: "Version", accessor: "version", sortable: true},
        {label: "Status", accessor: "status", sortable: true},
        {label: "Parameters", accessor: "parameters", sortable: false}
    ];
    return (
        <table data-testid="table" className="table table-hover table-bordered table-sm">
            <thead>
            <tr>
                {headers.map(({label, accessor, sortable}) => (
                    <th key={accessor}
                        onClick={() => sortable ? console.log(`We shall implement sort by ${accessor}`) : null}>
                        <span className="m-4">{label}</span>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((packet, key) => (
                <tr key={`row-${key}`}>
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
                            <ul className="list-unstyled ">
                                {Object.entries(packet.parameters).map(([key, value]) => (
                                    <li className="justify-content-evenly" key={`col-${key}`}>{key}={value}</li>
                                ))}
                            </ul>
                        </span>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
