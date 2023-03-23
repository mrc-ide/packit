export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface SidebarProps {
    onChangeSideBar: (item: SideBarItems) => void
}

export interface Packet {
    id: string,
    name: string,
    displayName: string,
    published: boolean,
    parameters: string
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
    packetsError: string | null
}

export interface RootState {
    packets: PacketsState
}
