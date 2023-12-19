import { JwtPayload } from "jwt-decode";

export enum SideBarItems {
  explorer,
  packetRunner,
  workflowRunner,
  projectDoc
}

export interface Pageable {
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
}
export interface PageablePackets extends Pageable {
  content: Packet[];
}

export interface PageablePacketGroupSummary extends Pageable {
  content: PacketGroupSummary[];
}
export interface PacketGroupSummary {
  name: string;
  packetCount: number;
  latestId: string;
  latestTime: number;
}

export interface Packet {
  id: string;
  name: string;
  displayName: string;
  published: boolean;
  parameters: Record<string, string | number>;
  importTime: number;
  startTime: number;
  endTime: number;
}

export interface PacketTableProps {
  data: Packet[];
}

export interface PacketMetadata {
  id: string;
  name: string;
  displayName?: string;
  published?: boolean;
  parameters: Record<string, string> | null;
  time: TimeMetadata;
  files: FileMetadata[];
  custom: Custom;
  git?: GitMetadata;
}

export interface GitMetadata {
  branch: string;
  sha: string;
  url: string[];
}

export interface TimeMetadata {
  start: number;
  end: number;
}

export interface Custom {
  orderly: {
    artefacts: Artefact[];
    description: Description;
  };
}

interface Description {
  custom: Record<string, string> | null;
  display: string | null;
}

interface Artefact {
  description: string;
  paths: string[];
}

export interface FileMetadata {
  path: string;
  size: number;
  hash: string;
}

export interface PacketJwtPayload extends JwtPayload {
  displayName: string;
  userName: string;
  datetime: number;
}
