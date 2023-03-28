import {AsyncThunk} from "@reduxjs/toolkit";
import {Error, Packet} from "../../../types";
import {api} from "../../../apiService";

export interface PacketActions {
    fetchPackets: AsyncThunk<Packet[], void, { rejectValue: Error }>;
}

export const actions: PacketActions = {
    fetchPackets: api<Packet[], Error>("GetPackets")
        .get("/packet")
};
