import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {Packet, PacketMetadata, PageablePackets, Pagination, RejectedErrorValue} from "../../../types";
import {api, CustomAsyncThunkOptions} from "../../../apiService";
import qs from "qs";

export interface PacketsActions {
    fetchPackets: AsyncThunk<PageablePackets, Pagination, RejectedErrorValue>;
    //fetchPacketsx: AsyncThunk<Packet[], void, RejectedErrorValue>;
    //fetchPacketByIdx: AsyncThunk<PacketMetadata, string, RejectedErrorValue>;
    fetchPacketById: AsyncThunk<PacketMetadata, string, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetPackets = "GetPackets",
    GetPacket = "GetPacket"
}

export const actions: PacketsActions = {
    //fetchPacketsx: api.get<Packet[], void>(PacketsMutationType.GetPackets, "/packets"),

    //fetchPacketByIdx: api.get<PacketMetadata, string>(PacketsMutationType.GetPacket, "/packets/metadata"),

    fetchPackets: createAsyncThunk<PageablePackets, Pagination, CustomAsyncThunkOptions>(
        PacketsMutationType.GetPackets,
        async (queryParams, thunkAPI) =>
            api.getx(`/packets/?${qs.stringify(queryParams)}`, thunkAPI)),

    fetchPacketById: createAsyncThunk<PacketMetadata, string, CustomAsyncThunkOptions>(
        PacketsMutationType.GetPacket,
        async (packetId, thunkAPI) =>
            api.getx(`/packets/metadata/${packetId}`, thunkAPI))

};
