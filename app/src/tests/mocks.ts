import { RoleWithRelationships } from "../app/components/contents/manageAccess/types/RoleWithRelationships";
import { AuthConfig } from "../app/components/providers/types/AuthConfigTypes";
import { UserState } from "../app/components/providers/types/UserTypes";
import { Custom, PacketMetadata, PageablePacketGroupSummary, PageablePackets } from "../types";

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
  importTime: 1701694312,
  startTime: 1701694312,
  endTime: 1701694312
};

export const mockAuthConfig: AuthConfig = {
  enableAuth: true,
  enableGithubLogin: true,
  enableBasicLogin: true
};

export const mockUserState: UserState = {
  displayName: "LeBron James",
  userName: "goat",
  token:
    // eslint-disable-next-line max-len
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwidXNlck5hbWUiOiJhYnN0ZXJuYXRvciIsImRpc3BsYXlOYW1lIjoiQW5tb2wgVGhhcGFyIiwiZGF0ZXRpbWUiOjE3MDI5NzgyMjgsImF1IjpbIltVU0VSXSJdLCJleHAiOjE3MDMwNjQ2Mjh9.o3b4PzZX76nP2tUxndGvusx-rytOkApodZ-geVPH9Pg",
  exp: 1703064628,
  authorities: ["user.manage", "packet.read"]
};

/**
 * {
  "aud": "packit",
  "iss": "packit-api",
  "userName": "d@gmail.com",
  "displayName": "random pussio",
  "datetime": 1715929239,
  "au": [
    "d@gmail.com",
    "ADMIN",
    "user.manage",
    "packet.push",
    "packet.run",
    "packet.read"
  ],
  "exp": 1716015639
}
 */
export const mockToken =
  // eslint-disable-next-line max-len
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwidXNlck5hbWUiOiJkQGdtYWlsLmNvbSIsImRpc3BsYXlOYW1lIjoicmFuZG9tIHB1c3NpbyIsImRhdGV0aW1lIjoxNzE1OTI5MjM5LCJhdSI6WyJkQGdtYWlsLmNvbSIsIkFETUlOIiwidXNlci5tYW5hZ2UiLCJwYWNrZXQucHVzaCIsInBhY2tldC5ydW4iLCJwYWNrZXQucmVhZCJdLCJleHAiOjE3MTYwMTU2Mzl9.l4GgV0YoENGT3tjS-2popxWxRHp_LRT5gIVP3nND838";

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

export const mockPacket: PacketMetadata = {
  id: "20231205-073527-99db1138",
  name: "parameters",
  parameters: {
    a: "3",
    b: "10",
    c: "100000"
  },
  files: [
    {
      path: "orderly.R",
      size: 137,
      hash: "sha256:642a63530122492327ace81e8e06f89954b5f339f8e64fff18db2a5b2cd4d088"
    },
    {
      path: "report.html",
      size: 40,
      hash: "sha256:715f397632046e65e0cc878b852fa5945681d07ab0de67dcfea010bb6421cca1"
    }
  ],
  git: {
    branch: "mrc-4721-packet-group",
    sha: "86148e9a6d2cc23b9adb331eea8288ef8177cee6",
    url: ["https://github.com/mrc-ide/packit.git"]
  },
  time: {
    end: 1701761728.1994,
    start: 1701761727.6453
  },
  custom: {
    orderly: {
      artefacts: [
        {
          description: "An HTMl report",
          paths: ["report.html"]
        }
      ],
      description: {
        custom: null,
        display: null
      }
    }
  }
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
      importTime: 1701761844,
      startTime: 1701761844,
      endTime: 1701761844
    },
    {
      id: "20231205-073527-99db1138",
      name: "parameters",
      displayName: "parameters",
      parameters: {},
      published: false,
      importTime: 1701761734,
      startTime: 1701761734,
      endTime: 1701761734
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
      importTime: 1701694312,
      startTime: 1701694312,
      endTime: 1701694312
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
      importTime: 1701694312,
      startTime: 1701694312,
      endTime: 1701694312
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
      importTime: 1701694312,
      startTime: 1701694312,
      endTime: 1701694312
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

export const mockFileBlob = new Blob(["test contents"]);

export const mockNonUsernameRolesWithRelationships: RoleWithRelationships[] = [
  {
    name: "Admin",
    rolePermissions: [
      {
        permission: "packet.run",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 5
      },
      {
        permission: "user.manage",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 6
      },
      {
        permission: "packet.read",
        packet: null,
        tag: null,
        packetGroup: {
          name: "depends",
          id: 4
        },
        id: 14
      },
      {
        permission: "packet.read",
        packet: {
          name: "modup-201707-queries1",
          id: "20170818-164847-7574883b"
        },
        tag: null,
        packetGroup: null,
        id: 13
      },
      {
        permission: "packet.run",
        packet: null,
        tag: null,
        packetGroup: {
          name: "explicit",
          id: 3
        },
        id: 15
      }
    ],
    users: [
      {
        username: "b@gmail.com",
        id: "fd261b07-9a4b-4a1d-9b66-88d708b63264"
      },
      {
        username: "c@gmail.com",
        id: "5390a192-371c-49fe-8b67-efcc250daaa9"
      },
      {
        username: "d@gmail.com",
        id: "3c0e2e83-c7a9-420c-82db-c3327931f1c0"
      },
      {
        username: "e@gmail.com",
        id: "a3e56ca4-e9ed-474a-bd4d-3d60508746d1"
      },
      {
        username: "a@gmail.com",
        id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e"
      }
    ],
    id: 7,
    isUsername: false
  },
  {
    name: "Modeller",
    rolePermissions: [
      {
        permission: "packet.run",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 7
      },
      {
        permission: "user.manage",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 8
      },
      {
        permission: "packet.read",
        packet: null,
        tag: null,
        packetGroup: {
          name: "depends",
          id: 4
        },
        id: 18
      },
      {
        permission: "packet.read",
        packet: null,
        tag: null,
        packetGroup: {
          name: "depends",
          id: 4
        },
        id: 19
      },
      {
        permission: "packet.read",
        packet: {
          name: "modup-201707-queries1",
          id: "20170818-164847-7574883b"
        },
        tag: null,
        packetGroup: null,
        id: 16
      },
      {
        permission: "packet.read",
        packet: {
          name: "modup-201707-queries1",
          id: "20170818-164847-7574883b"
        },
        tag: null,
        packetGroup: null,
        id: 17
      },
      {
        permission: "packet.run",
        packet: null,
        tag: null,
        packetGroup: {
          name: "explicit",
          id: 3
        },
        id: 20
      },
      {
        permission: "packet.run",
        packet: null,
        tag: null,
        packetGroup: {
          name: "explicit",
          id: 3
        },
        id: 21
      }
    ],
    users: [
      {
        username: "b@gmail.com",
        id: "fd261b07-9a4b-4a1d-9b66-88d708b63264"
      },
      {
        username: "c@gmail.com",
        id: "5390a192-371c-49fe-8b67-efcc250daaa9"
      },
      {
        username: "a@gmail.com",
        id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e"
      }
    ],
    id: 8,
    isUsername: false
  },
  {
    name: "Viewer",
    rolePermissions: [],
    users: [],
    id: 11,
    isUsername: false
  }
];
export const mockUsernameRolesWithRelationships: RoleWithRelationships[] = [
  {
    name: "a@gmail.com",
    rolePermissions: [
      {
        permission: "user.manage",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 83
      },
      {
        permission: "packet.read",
        packet: {
          name: "modup-201707-queries1",
          id: "20170818-164847-7574883b"
        },
        tag: null,
        packetGroup: null,
        id: 81
      },
      {
        permission: "packet.push",
        packet: null,
        tag: null,
        packetGroup: {
          name: "depends",
          id: 4
        },
        id: 82
      }
    ],
    users: [
      {
        username: "a@gmail.com",
        id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e"
      }
    ],
    id: 2,
    isUsername: true
  },
  {
    name: "c@gmail.com",
    rolePermissions: [
      {
        permission: "packet.push",
        packet: null,
        tag: null,
        packetGroup: {
          name: "explicit",
          id: 3
        },
        id: 39
      }
    ],
    users: [
      {
        username: "c@gmail.com",
        id: "5390a192-371c-49fe-8b67-efcc250daaa9"
      }
    ],
    id: 4,
    isUsername: true
  },
  {
    name: "x@gmail.com",
    rolePermissions: [],
    users: [{ id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e", username: "x@gmail.com" }],
    id: 11,
    isUsername: true
  }
];

export const mockUsersWithRoles = [
  {
    username: "a@gmail.com",
    id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e",
    roles: [
      {
        name: "Admin",
        id: 7
      },
      {
        name: "Modeller",
        id: 8
      }
    ],
    specificPermissions: [
      {
        permission: "user.manage",
        packet: null,
        tag: null,
        packetGroup: null,
        id: 83
      },
      {
        permission: "packet.read",
        packet: {
          name: "modup-201707-queries1",
          id: "20170818-164847-7574883b"
        },
        tag: null,
        packetGroup: null,
        id: 81
      },
      {
        permission: "packet.push",
        packet: null,
        tag: null,
        packetGroup: {
          name: "depends",
          id: 4
        },
        id: 82
      }
    ]
  },
  {
    username: "b@gmail.com",
    id: "fd261b07-9a4b-4a1d-9b66-88d708b63264",
    roles: [
      {
        name: "Admin",
        id: 7
      },
      {
        name: "Modeller",
        id: 8
      }
    ],
    specificPermissions: []
  },
  {
    username: "c@gmail.com",
    id: "5390a192-371c-49fe-8b67-efcc250daaa9",
    roles: [
      {
        name: "Admin",
        id: 7
      },
      {
        name: "Modeller",
        id: 8
      }
    ],
    specificPermissions: [
      {
        permission: "packet.push",
        packet: null,
        tag: null,
        packetGroup: {
          name: "explicit",
          id: 3
        },
        id: 39
      }
    ]
  },
  {
    username: "d@gmail.com",
    id: "3c0e2e83-c7a9-420c-82db-c3327931f1c0",
    roles: [
      {
        name: "Admin",
        id: 7
      }
    ],
    specificPermissions: []
  },
  {
    username: "e@gmail.com",
    id: "a3e56ca4-e9ed-474a-bd4d-3d60508746d1",
    roles: [
      {
        name: "Admin",
        id: 7
      }
    ],
    specificPermissions: []
  },
  {
    username: "x@gmail.com",
    id: "b13c35b8-7070-47a8-9266-3a23ae6fd76e",
    roles: [],
    specificPermissions: []
  }
];
