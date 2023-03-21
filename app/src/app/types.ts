export enum SideBarItems {
    explorer,
    packetRunner,
    workflowRunner,
    projectDoc
}

export interface SidebarProps {
    onChangeSideBar: (item: SideBarItems) => void
}