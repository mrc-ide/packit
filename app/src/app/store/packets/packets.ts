import {Packet, PacketsState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./thunks";

export const initialPacketsState: PacketsState = {
    packets: [],
    error: null,
    packet: {} as Packet,
    packetError: null
};

export const packetsSlice = createSlice({
    name: "packets",
    initialState: initialPacketsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchPackets.fulfilled, (state, action) => {
                state.packets = action.payload;
                state.error = null;
            })
            .addCase(actions.fetchPackets.rejected, (state, action) => {
                state.error = action.payload ?? null;
            })
            .addCase(actions.fetchPacketById.fulfilled, (state, action) => {
                state.packet = action.payload;
                state.packetError = null;
            })
            .addCase(actions.fetchPacketById.rejected, (state, action) => {
                state.packetError = action.payload ?? null;
            });
    }
});

export default packetsSlice.reducer;
