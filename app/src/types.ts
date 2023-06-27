import {useDispatch} from "react-redux";
import store, {rootReducer} from "./app/store/store";
import {SerializedError} from "@reduxjs/toolkit";

export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface RejectedErrorValue {
    rejectValue: Error
}

export interface Packet {
    id: string,
    name: string,
    displayName: string,
    published: boolean,
    parameters: Record<string, string>
}

export interface Header {
    label: string,
    accessor: keyof Packet,
    sortable: boolean
}

export interface PacketTableProps {
    data: Packet[]
}

export interface PacketsState {
    packets: Packet[]
    error:  null | Error
    packet: Packet,
    packetError: null | Error
}

export interface Error {
    error: {
        detail: string
        error: string
    }
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
