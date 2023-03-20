export enum SideBarItems {
    explorer,
    runPacket,
    runWorkflow,
    projectDoc
}

export interface SidebarProps {
    onChangeSideBar: (item: SideBarItems) => void
}