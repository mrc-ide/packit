import {combineReducers, configureStore} from "@reduxjs/toolkit";
import packetsReducer from "./packets/packets";
import loginReducer from "./login/login";

export const rootReducer = combineReducers({
    packets: packetsReducer,
    login: loginReducer
});

export default configureStore({
    reducer: rootReducer
});
