import {combineReducers, configureStore} from "@reduxjs/toolkit";
import packetsReducer from "./packets/packets";

export const rootReducer = combineReducers({
    packets: packetsReducer
});

export default configureStore({
    reducer: rootReducer
});
