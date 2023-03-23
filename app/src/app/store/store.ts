import {configureStore} from "@reduxjs/toolkit";
import packetsReducer from "./packets/packets";

export default configureStore({
    reducer: {
        packets: packetsReducer
    },
});
