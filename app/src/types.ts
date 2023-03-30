import {useDispatch} from "react-redux";
import store, {rootReducer} from "./app/store/store";

export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface RejectedErrorValue {
    rejectValue: string
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

export interface PacketTableProps {
    data: Packet[]
}

export interface PacketsState {
    packets: Packet[]
    packetsError: string | null
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
