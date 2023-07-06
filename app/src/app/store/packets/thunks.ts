import {AsyncThunk} from "@reduxjs/toolkit";
import {Packet, PacketMetadata, RejectedErrorValue} from "../../../types";
import {api} from "../../../apiService";

export interface PacketsActions {
    fetchPackets: AsyncThunk<Packet[], void, RejectedErrorValue>;
    fetchPacketMetadataById: AsyncThunk<PacketMetadata, string, RejectedErrorValue>;
    fetchFileByHash: AsyncThunk<string, string, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetPackets = "GetPackets",
    GetPacket = "GetPacket",
    GetFile = "GetFile"
}

export const actions: PacketsActions = {
    fetchPackets: api.get<Packet[], void>(PacketsMutationType.GetPackets, "/packets"),
    fetchPacketMetadataById: api.get<PacketMetadata, string>(PacketsMutationType.GetPacket, "/packets/metadata"),
    fetchFileByHash: api.download<string, string>(PacketsMutationType.GetFile, "/packets/file")
};
