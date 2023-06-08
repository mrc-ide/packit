import React, {useState} from "react";
import {Header, Packet, PacketTableProps} from "../../../../types";
import {FaSort} from "react-icons/fa";

const headers: Header[] = [
    {label: "Name", accessor: "displayName", sortable: true},
    {label: "Version", accessor: "id", sortable: false},
    {label: "Status", accessor: "published", sortable: true},
    {label: "Parameters", accessor: "parameters", sortable: false}
];

export default function Table({data, setSelectedPacket}: PacketTableProps) {
    const [ascending, setAscending] = useState(true);
    const [sortColumn, setSortColumn] = useState("");

    const setPacket = (id: string) => {
        setSelectedPacket(id);
    };

    const sortPackets = (accessor: string) => {
        const newAscending = (accessor === sortColumn) ? !ascending : true;
        setAscending(newAscending);
        setSortColumn(accessor);

        data.sort((a, b) => (`${a[accessor as keyof Packet]}`
            .localeCompare(`${b[accessor as keyof Packet]}`)) * (newAscending ? 1 : -1));
    };

    return (
        <table data-testid="table" className="table table-hover table-bordered table-sm">
            <thead>
            <tr>
                {headers.map(({label, accessor, sortable}) => (
                    <th key={accessor}>
                        <span className="m-4"
                              onClick={() => sortable ? sortPackets(accessor) : null}>
                            {label}
                            {sortable ? <span className="px-2 icon-sort"><FaSort/></span> : ""}
                        </span>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((packet, key) => (
                <tr key={`row-${key}`}>
                    <td>
                        <span>
                            <a href="#"
                               onClick={() => setPacket(packet.id)}>
                                {packet.displayName ? packet.displayName : packet.name}
                            </a>
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
