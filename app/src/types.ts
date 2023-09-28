import {useDispatch} from "react-redux";
import store, {rootReducer} from "./app/store/store";
import {AsyncThunkOptions} from "@reduxjs/toolkit";

export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface RejectedErrorValue {
    rejectValue: Error
}

export interface PageablePackets {
    content: Packet[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    first: boolean;
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
    pageablePackets: PageablePackets
    fetchPacketsError:  null | Error
    packet: PacketMetadata,
    packetError: null | Error
}

export interface LoginState {
    user: CurrentUser
    userError:  null | Error
    isAuthenticated: boolean,
    authConfig: Record<string, any>,
    authConfigError: null | Error
}

export interface PacketMetadata {
    id: string
    name: string
    displayName?: string
    published?: boolean
    parameters: Record<string, string> | null
    time: TimeMetadata
    files: FileMetadata[]
    custom: Custom
    git?: GitMetadata
}

export interface GitMetadata {
    branch: string
    sha: string
    url: string[]
}

export interface TimeMetadata {
    start: number
    end: number
}

export interface Custom {
    orderly: {
        artefacts: Artefact[]
        description: Description
    }
}

interface Description {
    custom: Record<string, string>
    display: string
}

interface Artefact {
    description: string
    paths: string[]
}

export interface FileMetadata {
    path: string,
    size: number,
    hash: string
}

export interface Error {
    error: {
        detail: string
        error: string
    }
}

export interface PaginationProps {
    pageNumber: number
    pageSize: number
}

export interface UserLoginDetailProps {
    email: string
    password: string
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export interface CustomAsyncThunkOptions extends AsyncThunkOptions<void, RejectedErrorValue> {
    rejectValue: Error
}

export interface CurrentUser {
    token: string
}
