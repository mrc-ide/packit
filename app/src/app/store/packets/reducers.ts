import {Packet, PacketsState} from "../../types";
import {PayloadAction} from "@reduxjs/toolkit";

interface PacketsReducers {
    setPackets: (state: PacketsState, action: PayloadAction<Packet[]>) => void;
    setPacketsError: (state: PacketsState, action: PayloadAction<string | null>) => void;
}

export const packetsReducers: PacketsReducers = {
    setPackets: (state, action) => {
        state.packets = action.payload;
    },
    setPacketsError: (state, action) => {
        state.packetsError = action.payload;
    }
};
