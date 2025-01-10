import { JwtPayload } from "jwt-decode";

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
  name: string;
  packetCount: number;
  latestId: string;
  latestTime: number;
  latestDisplayName: string;
}

export interface PacketGroupDisplay {
  latestDisplayName: string;
  description?: string;
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

interface Platform {
  version: string;
  os: string;
  system: string;
}

interface Package {
  package: string;
  version: string;
  attached: boolean;
}

interface Session {
  platform: Platform;
  packages: Package[];
}

export interface Custom {
  orderly: {
    artefacts: Artefact[];
    description: Description;
    session: Session;
    role: Role[];
  };
}

interface Description {
  display: string | null;
  long: string | null;
  custom: Record<string, any> | null;
}

export interface Artefact {
  description: string;
  paths: string[];
}

export interface Role {
  path: string;
  role: Roles;
}

export enum Roles {
  Orderly = "orderly",
  Resource = "resource",
  Dependency = "dependency",
  Shared = "shared",
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
