import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {
    CustomAsyncThunkOptions,
    PacketMetadata,
    PageablePackets,
    PaginationProps,
    RejectedErrorValue
} from "../../../types";
import {api} from "../../../apiService";
import qs from "qs";

export interface PacketsActions {
    fetchPackets: AsyncThunk<PageablePackets, PaginationProps, RejectedErrorValue>;
    fetchPacketById: AsyncThunk<PacketMetadata, string, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetPackets = "GetPackets",
    GetPacket = "GetPacket"
}

export const actions: PacketsActions = {
    fetchPackets: createAsyncThunk<PageablePackets, PaginationProps, CustomAsyncThunkOptions>(
        PacketsMutationType.GetPackets,
        async (props, thunkAPI) =>
            api().get(`/packets?${qs.stringify(props)}`, thunkAPI)),

    fetchPacketById: createAsyncThunk<PacketMetadata, string, CustomAsyncThunkOptions>(
        PacketsMutationType.GetPacket,
        async (packetId, thunkAPI) =>
            api().get(`/packets/metadata/${packetId}`, thunkAPI))
};
