import {AsyncThunk} from "@reduxjs/toolkit";
import {Error, Packet} from "../../../types";
import {api} from "../../../apiService";

export interface PacketsActions {
    fetchPackets: AsyncThunk<Packet[], void, { rejectValue: Error }>;
}

export enum PacketsUploadMutation {
    GetPackets = "GetPackets"
}

export const actions: PacketsActions = {
    fetchPackets: api<Packet[], Error>(PacketsUploadMutation.GetPackets)
        .get("/packet")
};
