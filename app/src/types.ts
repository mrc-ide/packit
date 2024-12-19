import { JwtPayload } from "jwt-decode";

export enum PacketSideBarItems {
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

export interface PageablePacketGroupSummaries extends Pageable {
  content: PacketGroupSummary[];
}

export interface PacketGroupSummary {
  latestDescription?: string;
  latestDisplayName: string;
  latestPacketId: string;
  latestStartTime: number;
  name: string;
  packetCount: number;
  packetGroupId: number;
}

export interface PacketGroupDisplay {
  latestDisplayName: string;
  latestDescription?: string;
}

export interface Packet {
  id: string;
  name: string;
  displayName: string;
  published: boolean;
  parameters: Record<string, string | number | boolean>;
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
  custom: Custom | null;
  git: GitMetadata | null;
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
  display: string | null;
  long: string | null;
  custom: Record<string, any> | null;
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
  au: string[];
}

export interface PacketErrorBody {
  data: Record<string, unknown>;
  error: {
    detail: string;
    error: string;
  };
  status: string;
}

export interface PageableBasicDto extends Pageable {
  content: {
    name: string;
    id: string | number;
  }[];
}
