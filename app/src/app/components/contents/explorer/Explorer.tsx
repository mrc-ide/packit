import React, {useEffect} from "react";
import Table from "./Table";
import {useSelector} from "react-redux";
import {RootState, SideBarItems, useAppDispatch} from "../../../../types";
import {actions} from "../../../store/packets/thunks";
import {setActiveSideBar} from "../../../store/packets/packets";

export default function Explorer() {
    const dispatch = useAppDispatch();
    const {packets} = useSelector((state: RootState) => state.packets);

    useEffect(() => {
        dispatch(actions.fetchPackets());
    }, []);

    const showPacketDetail = (id: string) => {
        dispatch(actions.fetchPacketById(id));
        dispatch(setActiveSideBar(SideBarItems.packetRunner));
    };

    return (
        <div data-testid="explorer" className="content explorer">
            <div className="small">
                <span className="d-flex">Packets ({packets.length})</span>
                <span className="d-flex pb-3">Click on a column heading to sort by field.</span>
            </div>
            <div className="content-box">
                <div className="table-responsive-sm pt-4">
                    <Table data={packets.slice(0, 5)} setSelectedPacket={(id) => showPacketDetail(id)} />
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
