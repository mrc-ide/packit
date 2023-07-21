import React, {useEffect, useState} from "react";
import Table from "./Table";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../types";
import {actions} from "../../../store/packets/thunks";

export default function Explorer() {
    const dispatch = useAppDispatch();
    const {packets, pageablePackets} = useSelector((state: RootState) => state.packets);
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState(1);
    const pageSizeOptions = [10, 25, 50, 100];

    const handlePageChange = (page: number) => {
        setPageNumber(page);
    };

    useEffect(() => {
        dispatch(actions.fetchPackets({pageNumber, pageSize}));
    }, [pageNumber, pageSize]);

    return (
        <div data-testid="explorer" className="content explorer">
            <div className="small">
                <span className="d-flex">Packets ({packets.length})</span>
                <span className="d-flex pb-3">Click on a column heading to sort by field.</span>
            </div>
            <div className="content-box">
                <div className="table-responsive-sm pt-4">
                    <Table data={packets} />
                </div>
                <div data-testid="pagination-content" className="d-flex justify-content-between">
                    <div className="d-flex pt-xxl-5 justify-content-start m-2">
                        <div className="col-auto m-1">Show</div>
                        <div className="col-auto">
                            <select className="form-select"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}>
                                {pageSizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-auto m-1">entries</div>
                    </div>
                    <div className="m-2 d-flex pt-xxl-5 justify-content-end">
                        <nav aria-label="pagination">
                            <ul className="pagination">
                                <li className={`page-item ${pageNumber === 0 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(pageNumber - 1)}
                                        disabled={pageNumber === 0}>
                                        Previous
                                    </button>
                                </li>
                                {[...Array(pageablePackets.totalPages)].map((_, index) => (
                                    <li key={index} className={`page-item ${pageNumber === index ? "active" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(index)}>
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item 
                                    ${pageNumber >= pageablePackets.totalPages - 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(pageNumber + 1)}
                                        disabled={pageNumber >= pageablePackets.totalPages - 1}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
