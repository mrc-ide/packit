import {
  CurrentUser,
  Custom,
  LoginState,
  PacketMetadata,
  PacketsState,
  PageablePacketGroupSummary,
  PageablePackets
} from "../types";

export const mockPacketsState = (props: Partial<PacketsState> = {}): PacketsState => {
  return {
    pageablePackets: {} as PageablePackets,
    packet: {} as PacketMetadata,
    fetchPacketsError: null,
    packetError: null,
    ...props
  };
};

export const mockPacketResponse = {
  id: "52fd88b2-8ee8-4ac0-a0e5-41b9a15554a4",
  name: "Interim update for covid impact iu touchstone2",
  displayName: "touchstone",
  parameters: {
    city_subset: "63f730b9fc13ae1df6000070"
  },
  custom: {} as Custom,
  files: [{ hash: "sha:234:50873fVFDSVSF4", path: "data.rds", size: 97 }],
  published: false,
  time: 1701694312
};

export const mockPacketGroupSummary: PageablePacketGroupSummary = {
  content: [
    {
      latestId: "20231130-082812-cd744153",
      latestTime: 1701332897,
      name: "test3",
      packetCount: 3
    },
    {
      latestId: "20231130-082727-445fa3fa",
      latestTime: 1701332857,
      name: "test2",
      packetCount: 3
    },
    {
      latestId: "20231130-082548-bf6d6f3f",
      latestTime: 1701332757,
      name: "test1",
      packetCount: 2
    },
    {
      latestId: "20231130-082348-e1f8e7ca",
      latestTime: 1701332637,
      name: "incoming_data",
      packetCount: 2
    },
    {
      latestId: "20231127-141002-6e6581d7",
      latestTime: 1701256330,
      name: "artefact-types",
      packetCount: 3
    },
    {
      latestId: "20230427-150722-0ebd6545",
      latestTime: 1701096608,
      name: "parameters",
      packetCount: 3
    },
    {
      latestId: "20230427-150755-2dbede93",
      latestTime: 1701096607,
      name: "explicit",
      packetCount: 2
    },
    {
      latestId: "20230427-150828-68772cee",
      latestTime: 1701096605,
      name: "computed-resource",
      packetCount: 1
    },
    {
      latestId: "20230427-150813-cd121720",
      latestTime: 1698173547,
      name: "depends",
      packetCount: 1
    }
  ],
  totalPages: 1,
  totalElements: 9,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 9
};

export const mockPacketGroupResponse: PageablePackets = {
  content: [
    {
      id: "20231205-073715-6635e044",
      name: "parameters",
      displayName: "parameters",
      parameters: {
        a: 3,
        b: 10,
        c: 100000
      },
      published: false,
      time: 1701761844
    },
    {
      id: "20231205-073527-99db1138",
      name: "parameters",
      displayName: "parameters",
      parameters: {},
      published: false,
      time: 1701761734
    },
    {
      id: "20230427-150722-0ebd6545",
      name: "parameters",
      displayName: "parameters",
      parameters: {
        c: 30,
        b: 2,
        a: 10
      },
      published: true,
      time: 1701694312
    },
    {
      id: "20231127-133335-c8ced0bf",
      name: "parameters",
      displayName: "parameters",
      parameters: {
        a: 30,
        c: 90,
        b: 22
      },
      published: false,
      time: 1701694312
    },
    {
      id: "20231127-133612-c69df160",
      name: "parameters",
      displayName: "parameters",
      parameters: {
        b: 333,
        c: 11,
        a: 1
      },
      published: false,
      time: 1701694312
    }
  ],
  totalPages: 1,
  totalElements: 5,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 5
};

export const mockLoginState = (props: Partial<LoginState> = {}): LoginState => {
  return {
    user: {} as CurrentUser,
    userError: null,
    isAuthenticated: false,
    authConfig: {},
    authConfigError: null,
    ...props
  };
};

export const mockFileBlob = new Blob(["test contents"]);
