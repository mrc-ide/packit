import React, {useEffect} from "react";
import Table from "./Table";
import {useSelector} from "react-redux";
import {actions} from "../../../store/packets/actions";
import {RootState} from "../../../types";

export default function Explorer() {
    const {packets} = useSelector((state: RootState) => state.packets);

    useEffect(() => {
        actions.getPackets();
    }, []);

    const headers = [
        {label: "Name", accessor: "name", sortable: true},
        {label: "Version", accessor: "version", sortable: true},
        {label: "Status", accessor: "status", sortable: true},
        {label: "Parameters", accessor: "parameters", sortable: false}
    ];
    return (
        <div className="content explorer">
            <div className="small">
                <span className="d-flex">Packets ({packets.length})</span>
                <span className="d-flex pb-3">Click on a column heading to sort by field.</span>
            </div>
            <div className="content-box">
                <div className="table-responsive-sm pt-4">
                    <table data-testid="table" className="table table-hover table-bordered table-sm">
                        <Table data={packets.slice(0, 5)} headers={headers}/>
                    </table>
                </div>
                <div data-testid="pagination-content" className="d-flex pt-xxl-5 align-items-center">
                    <div className="m-2">Show</div>
                    <div className="col-1">
                        <select className="form-select mr-sm-2" defaultValue={10}>
                            <option>10</option>
                            <option value="20">20</option>
                            <option value="20">50</option>
                            <option value="20">100</option>
                        </select>
                    </div>
                    <div className="m-2">entries</div>
                </div>
            </div>
        </div>
    );
}
