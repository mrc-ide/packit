import {PacketsState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./thunks";

export const initialPacketsState: PacketsState = {
    packets: [],
    packetsError: null
};

export const packetsSlice = createSlice({
    name: "packets",
    initialState: initialPacketsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchPackets.fulfilled, (state, action) => {
                state.packets = action.payload;
                state.packetsError = null;
            })
            .addCase(actions.fetchPackets.rejected, (state, action) => {
                state.packetsError = action.payload ?? null;
            });
    }
});

export default packetsSlice.reducer;
