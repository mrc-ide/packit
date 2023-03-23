import {packetsSlice} from "./packets";
import axios from "axios";
import store from "../store";

interface PacketsActions {
    getPackets: () => void;
}

export const actions: PacketsActions = {
    getPackets: () => {
        const {setPackets, setPacketsError} = packetsSlice.actions;
        axios.get("http://localhost:8080/packet")
            .then(({data}) => {
                store.dispatch(setPackets(data));
            })
            .catch((error) => {
                store.dispatch(setPacketsError(error));
            });
    }
};
