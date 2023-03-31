import {AsyncThunk} from "@reduxjs/toolkit";
import {Packet, RejectedErrorValue} from "../../../types";
import {api} from "../../../apiService";

export interface PacketsActions {
    fetchPackets: AsyncThunk<Packet[], void, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetPackets = "GetPackets"
}

export const actions: PacketsActions = {
    fetchPackets: api.get<Packet[]>(PacketsMutationType.GetPackets, "/packets")
};
