import {AsyncThunk} from "@reduxjs/toolkit";
import {Packet, RejectedErrorValue} from "../../../types";
import {api} from "../../../apiService";

export interface PacketsActions {
    fetchPackets: AsyncThunk<Packet[], void, RejectedErrorValue>;
    fetchPacketById: AsyncThunk<Packet, string, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetPackets = "GetPackets",
    GetPacket = "GetPacket"
}

export const actions: PacketsActions = {
    fetchPackets: api.get<Packet[], void>(PacketsMutationType.GetPackets, "/packets"),
    fetchPacketById: api.get<Packet, string>(PacketsMutationType.GetPacket, "/packets")
};
