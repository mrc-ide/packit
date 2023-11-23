import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../../types";
import { actions } from "../../../store/packets/packetThunks";
import Table from "./Table";

export default function Explorer() {
  const dispatch = useAppDispatch();
  const { pageablePackets } = useSelector((state: RootState) => state.packets);

  const packets = pageablePackets.content ?? [];
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const pageSizeOptions = [10, 25, 50, 100];

  const handlePageChange = (selected: number) => {
    setPageNumber(selected);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPageNumber(0);
  };

  useEffect(() => {
    dispatch(actions.fetchPackets({ pageNumber, pageSize }));
  }, [pageNumber, pageSize]);

  return (
    <div data-testid="explorer" className="content explorer">
      <div className="small">
        <span className="d-flex">Packets ({packets.length})</span>
        <span className="d-flex pb-3">Click on a column heading to sort by field.</span>
      </div>
      <div className="content-box">
        <div className="table-responsive-sm pt-4">
          <Table data={[...packets]} />
        </div>
        <div data-testid="pagination-content" className="d-flex justify-content-between">
          <div className="d-flex pt-xxl-5 justify-content-start m-2">
            <div className="col-auto m-1">Show</div>
            <div className="col-auto">
              <select className="form-select" value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value)}>
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
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageablePackets.totalPages || 0}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={(e) => handlePageChange(e.selected)}
              containerClassName={"pagination"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              activeClassName={"active"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
              disabledClassName={"disabled"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
