import {Packet, PacketsState, SideBarItems} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./thunks";

export const initialPacketsState: PacketsState = {
    packets: [],
    error: null,
    packet: {} as Packet,
    activeSideBar: SideBarItems.explorer
};

export const packetsSlice = createSlice({
    name: "packets",
    initialState: initialPacketsState,
    reducers: {
        setActiveSideBar: (state, action) => {
            state.activeSideBar = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchPackets.fulfilled, (state, action) => {
                state.packets = action.payload;
                state.error = null;
            })
            .addCase(actions.fetchPackets.rejected, (state, action) => {
                state.error = action.payload ?? action.error;
            })
            .addCase(actions.fetchPacketById.fulfilled, (state, action) => {
                state.packet = action.payload;
                state.error = null;
            })
            .addCase(actions.fetchPacketById.rejected, (state, action) => {
                state.error = action.payload ?? action.error;
            });
    }
});

export const {setActiveSideBar} = packetsSlice.actions;

export default packetsSlice.reducer;
