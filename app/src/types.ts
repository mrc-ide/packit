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
    rejectValue: SerializedError
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
    setSelectedBarItem: (item: SideBarItems) => void
}

export interface PacketsState {
    packets: Packet[]
    error: SerializedError | null
    packet: Packet
    activeSideBar: SideBarItems
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
