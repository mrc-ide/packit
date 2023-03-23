import {PacketsState} from "../../types";
import {createSlice} from "@reduxjs/toolkit";
import {packetsReducers} from "./reducers";

export const initialPacketsState: PacketsState = {
    packets: [],
    packetsError: null
};

export const packetsSlice = createSlice({
    name: "packets",
    initialState: initialPacketsState,
    reducers: {
        ...packetsReducers
    }
});

export default packetsSlice.reducer;