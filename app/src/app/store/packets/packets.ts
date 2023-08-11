import {PacketMetadata, PacketsState, PageablePackets} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./thunks";

export const initialPacketsState: PacketsState = {
    pageablePackets: {} as PageablePackets,
    fetchPacketsError: null,
    packet: {} as PacketMetadata,
    packetError: null,
};

export const packetsSlice = createSlice({
    name: "packets",
    initialState: initialPacketsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchPackets.fulfilled, (state, action) => {
                state.pageablePackets = action.payload;
                state.fetchPacketsError = null;
            })
            .addCase(actions.fetchPackets.rejected, (state, action) => {
                state.fetchPacketsError = action.payload ?? null;
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
