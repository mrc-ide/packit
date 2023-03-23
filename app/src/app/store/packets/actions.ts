import {packetsSlice} from "./packets";
import axios from "axios";
import {Dispatch} from "@reduxjs/toolkit";

interface PacketsActions {
    getPackets: (dispatch: Dispatch) => void;
}

export const actions: PacketsActions = {
    getPackets: (dispatch) => {
        const {setPackets, setPacketsError} = packetsSlice.actions;
        axios.get("http://localhost:8080/packet")
            .then(({data}) => {
                dispatch(setPackets(data));
            })
            .catch((error) => {
                dispatch(setPacketsError(error));
            });
    }
};
