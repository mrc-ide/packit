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

export interface SidebarProps {
    onChangeSideBar: (item: SideBarItems) => void
}

export interface Packet {
    id: string,
    name: string,
    displayName: string,
    published: boolean,
    parameters: Record<string, string>
}

export interface AssessorsProperty {
    name: string,
    displayName: string,
    id: string,
    published: boolean,
    parameters: string
}

export interface Header {
    label: string,
    accessor: keyof AssessorsProperty,
    sortable: boolean
}

export interface PacketTableProps {
    data: Packet[]
}

export interface PacketsState {
    packets: Packet[]
    packetsError: SerializedError | null
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
