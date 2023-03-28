import {useDispatch} from "react-redux";
import store, {rootReducer} from "./app/store/store";

export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface Error {
    message: string,
    status: number,
    error: string,
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

export interface Header {
    label: string,
    accessor: string,
    sortable: boolean
}

export interface PacketTable {
    headers: Header[],
    data: Packet[]
}

export interface PacketsState {
    packets: Packet[]
    packetsError: Error | null | undefined
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
