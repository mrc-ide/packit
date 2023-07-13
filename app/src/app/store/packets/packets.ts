import {PacketMetadata, PacketsState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./thunks";

export const initialPacketsState: PacketsState = {
    packets: [],
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
                state.packets = action.payload;
                state.fetchPacketsError = null;
            })
            .addCase(actions.fetchPackets.rejected, (state, action) => {
                state.fetchPacketsError = action.payload ?? null;
            })
            .addCase(actions.fetchPacketMetadataById.fulfilled, (state, action) => {
                state.packet = action.payload;
                state.packetError = null;
            })
            .addCase(actions.fetchPacketMetadataById.rejected, (state, action) => {
                state.packetError = action.payload ?? null;
            });
    }
});

export default packetsSlice.reducer;
