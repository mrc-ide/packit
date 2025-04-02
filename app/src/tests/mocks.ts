import { RoleWithRelationships } from "../app/components/contents/manageAccess/types/RoleWithRelationships";
import { GitBranches } from "../app/components/contents/runner/types/GitBranches";
import { PageableBasicRunInfo, RunInfo } from "../app/components/contents/runner/types/RunInfo";
import { Parameter, RunnerPacketGroup } from "../app/components/contents/runner/types/RunnerPacketGroup";
import { AuthConfig } from "../app/components/providers/types/AuthConfigTypes";
import { UserState } from "../app/components/providers/types/UserTypes";
import {
  Custom,
  PacketMetadata,
  PageableBasicDto,
  PageablePacketGroupSummaries,
  PageablePackets,
  InputFileType
} from "../types";

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
  enableBasicLogin: true,
  enabledPreAuthLogin: false
};

export const mockUserState: () => UserState = () => {
  return {
    displayName: "LeBron James",
    userName: "goat",
    token:
      // eslint-disable-next-line max-len
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwidXNlck5hbWUiOiJhYnN0ZXJuYXRvciIsImRpc3BsYXlOYW1lIjoiQW5tb2wgVGhhcGFyIiwiZGF0ZXRpbWUiOjE3MDI5NzgyMjgsImF1IjpbIltVU0VSXSJdLCJleHAiOjE3MDMwNjQ2Mjh9.o3b4PzZX76nP2tUxndGvusx-rytOkApodZ-geVPH9Pg",
    exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
    authorities: ["user.manage", "packet.read", "packet.run"]
  };
};

export const mockExpiredUserState: () => UserState = () => {
  return {
    displayName: "LeBron James",
    userName: "goat",
    token:
      // eslint-disable-next-line max-len
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwidXNlck5hbWUiOiJhYnN0ZXJuYXRvciIsImRpc3BsYXlOYW1lIjoiQW5tb2wgVGhhcGFyIiwiZGF0ZXRpbWUiOjE3MDI5NzgyMjgsImF1IjpbIltVU0VSXSJdLCJleHAiOjE3MDMwNjQ2Mjh9.o3b4PzZX76nP2tUxndGvusx-rytOkApodZ-geVPH9Pg",
    exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
    authorities: ["user.manage", "packet.read", "packet.run"]
  };
};

export const mockToken =
  // eslint-disable-next-line max-len
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYWNraXQiLCJpc3MiOiJwYWNraXQtYXBpIiwidXNlck5hbWUiOiJkQGdtYWlsLmNvbSIsImRpc3BsYXlOYW1lIjoicmFuZG9tIHB1c3NpbyIsImRhdGV0aW1lIjoxNzE1OTI5MjM5LCJhdSI6WyJkQGdtYWlsLmNvbSIsIkFETUlOIiwidXNlci5tYW5hZ2UiLCJwYWNrZXQucHVzaCIsInBhY2tldC5ydW4iLCJwYWNrZXQucmVhZCJdLCJleHAiOjE3MTYwMTU2Mzl9.l4GgV0YoENGT3tjS-2popxWxRHp_LRT5gIVP3nND838";

export const mockPacket: PacketMetadata = {
  id: "20240000-012345-00aa0000",
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
    },
    {
      path: "a_renamed_common_resource.csv",
      size: 11,
      hash: "sha256:550494109169d3b64a3285cf9e56e117ed06bb643811378697eb73d714724ccf"
    },
    {
      path: "directory/graph.png",
      size: 7344,
      hash: "sha256:154dba8290dd719800b56b9a3af6ee48fc5ac2e046610d76de5560b396d063a2"
    },
    {
      path: "artefact_data.csv",
      size: 51,
      hash: "sha256:c7b512b2d14a7caae8968830760cb95980a98e18ca2c2991b87c71529e223164"
    },
    {
      path: "excel_file.xlsx",
      size: 4715,
      hash: "sha256:2d45902d5232a91c53b51d4c2cb265338f40fb18e8b38a0fa850800e1cdb1f03"
    },
    {
      path: "internal_presentation.pdf",
      size: 14097,
      hash: "sha256:ae7b14cb83e0964b7bdde11b96b1f1bf9960bc46fbcddcdbb0056307915c1d4f"
    },
    {
      path: "other_extensions.txt",
      size: 15,
      hash: "sha256:c195ea0690238192d2a000c5e35f42469242bab0dc6a03b09dbffc5408a24170"
    },
    {
      path: "data.csv",
      size: 51,
      hash: "sha256:c7b512b2d14a7caae8968830760cb95980a98e18ca2c2991b87c71529e223164"
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
        },
        {
          description: "An artefact containing multiple files",
          paths: [
            "directory//graph.png",
            "artefact_data.csv",
            "excel_file.xlsx",
            "internal_presentation.pdf",
            "other_extensions.txt"
          ]
        }
      ],
      description: {
        custom: null,
        display: "A packet with parameters and a report",
        long: "This packet uses a number of parameters in order to eventually generate a report"
      },
      session: {
        packages: [
          {
            package: "library_of_interest",
            version: "0.1.0",
            attached: true
          },
          {
            package: "other_library",
            version: "1.0.0",
            attached: false
          }
        ],
        platform: {
          os: "Ubuntu 22.04.4 LTS",
          system: "x86_64, linux-gnu",
          version: "R version 4.4.1 (2024-06-14)"
        }
      },
      role: [
        {
          path: "data.csv",
          role: InputFileType.Resource
        },
        {
          path: "orderly.R",
          role: InputFileType.Orderly
        },
        {
          path: "a_renamed_common_resource.csv",
          role: InputFileType.Shared
        }
      ],
      shared: [
        {
          here: "a_renamed_common_resource.csv",
          there: "a_common_resource.csv"
        }
      ]
    }
  },
  depends: [
    {
      packet: "20231130-082812-cd744153",
      query: 'single(id == "20231130-082812-cd744153" && name == "test3")',
      files: []
    },
    { packet: "20231130-082727-445fa3fa", query: 'latest(name == "test2")', files: [] }
  ]
};

export const mockPacketGroupSummaries: PageablePacketGroupSummaries = {
  content: [
    {
      latestId: "20231130-082812-cd744153",
      latestTime: 1701332897,
      name: "test3",
      latestDisplayName: "Test 3",
      packetCount: 3
    },
    {
      latestId: "20231130-082727-445fa3fa",
      latestTime: 1701332857,
      name: "test2",
      latestDisplayName: "Test 2",
      packetCount: 3
    },
    {
      latestId: "20231130-082548-bf6d6f3f",
      latestTime: 1701332757,
      name: "test1",
      latestDisplayName: "Test 1",
      packetCount: 2
    },
    {
      latestId: "20231130-082348-e1f8e7ca",
      latestTime: 1701332637,
      name: "incoming_data",
      latestDisplayName: "Incoming Data",
      packetCount: 2
    },
    {
      latestId: "20231127-141002-6e6581d7",
      latestTime: 1701256330,
      name: "artefact-types",
      latestDisplayName: "Artefact Types",
      packetCount: 3
    },
    {
      latestId: mockPacket.id,
      latestTime: 1701096608,
      name: "parameters",
      latestDisplayName: "Parameters Packet Group",
      packetCount: 3
    },
    {
      latestId: "20230427-150755-2dbede93",
      latestTime: 1701096607,
      name: "explicit",
      latestDisplayName: "Explicit",
      packetCount: 2
    },
    {
      latestId: "20230427-150828-68772cee",
      latestTime: 1701096605,
      name: "computed-resource",
      latestDisplayName: "Computed Resource",
      packetCount: 1
    },
    {
      latestId: "20230427-150813-cd121720",
      latestTime: 1698173547,
      name: "depends",
      latestDisplayName: "depends",
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

export const mockPacketGroupSummariesFiltered: PageablePacketGroupSummaries = {
  content: [
    {
      latestId: mockPacket.id,
      latestTime: 1701096608,
      name: "parameters",
      latestDisplayName: "Parameters Packet Group",
      packetCount: 3
    }
  ],
  totalPages: 1,
  totalElements: 1,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 1
};

export const mockPacketGroupResponse: PageablePackets = {
  content: [
    {
      id: mockPacket.id,
      name: mockPacket.name,
      displayName: "Parameters Packet Group",
      parameters: {
        a: 3,
        b: false,
        c: "hello"
      },
      published: false,
      importTime: 1701761844,
      startTime: 1701761844,
      endTime: 1701761844
    },
    {
      id: "20231205-073527-99db1138",
      name: mockPacket.name,
      displayName: "parameters",
      parameters: {},
      published: false,
      importTime: 1701761734,
      startTime: 1701761734,
      endTime: 1701761734
    },
    {
      id: "20230427-150722-0ebd6545",
      name: mockPacket.name,
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
      name: mockPacket.name,
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
      name: mockPacket.name,
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
    name: "ADMIN",
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
        permission: "outpack.write",
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
        permission: "outpack.write",
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
        name: "ADMIN",
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
        permission: "outpack.write",
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
        name: "ADMIN",
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
        name: "ADMIN",
        id: 7
      },
      {
        name: "Modeller",
        id: 8
      }
    ],
    specificPermissions: [
      {
        permission: "outpack.write",
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
        name: "ADMIN",
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
        name: "ADMIN",
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

export const mockPacketGroupDtos: PageableBasicDto = {
  content: [
    { id: 1, name: "depends" },
    { id: 2, name: "explicit" },
    { id: 3, name: "incoming_data" },
    { id: 4, name: "parameters" },
    { id: 5, name: "test1" }
  ],
  totalPages: 1,
  totalElements: 5,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 5
};

export const mockTags: PageableBasicDto = {
  content: [
    { id: 1, name: "tag1" },
    { id: 2, name: "tag2" },
    { id: 3, name: "tag3" },
    { id: 4, name: "tag4" },
    { id: 5, name: "tag5" }
  ],
  totalPages: 1,
  totalElements: 5,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 5
};

export const mockGitBranches: GitBranches = {
  defaultBranch: "main",
  branches: [
    {
      name: "mrc-6969",
      commitHash: "00ca19bc743d4287adff2a1d6a72155ba743deb2",
      time: 1724850401,
      message: ["second commit"]
    },
    {
      name: "main",
      commitHash: "5df215b49e58d1f923f675fab8f6564341b91dd2",
      time: 1724832546,
      message: ["first commit"]
    }
  ]
};

export const mockRunnerPacketGroups: RunnerPacketGroup[] = [
  {
    name: "explicit",
    updatedTime: 1725006283.3433,
    hasModifications: false
  },
  {
    name: "incoming_data",
    updatedTime: 1725006283.3433,
    hasModifications: false
  },
  {
    name: "parameters",
    updatedTime: 1725006283.3433,
    hasModifications: false
  },
  {
    name: "test1",
    updatedTime: 1725006283.3433,
    hasModifications: false
  }
];

export const mockPacketGroupsParameters: Record<string, Parameter[]> = {
  explicit: [],
  incoming_data: [
    {
      name: "param1",
      value: 1
    },
    {
      name: "param2",
      value: false
    }
  ],
  parameters: [
    {
      name: "param1",
      value: null
    },
    {
      name: "param2",
      value: "hello"
    }
  ],
  test1: [
    {
      name: "param1",
      value: null
    },
    {
      name: "param2",
      value: true
    }
  ]
};

export const mockTaskId = "1234";

export const mockCompleteRunInfo: RunInfo = {
  taskId: mockTaskId,
  packetGroupName: "test-packetGroup",
  status: "COMPLETE",
  commitHash: "11a0029f5d7ce4df2e46d114a16abe96b6d2e7ca",
  branch: "master",
  logs: [
    "> Sys.sleep(70)",
    "[2024-09-18 08:44:31 (78)] START OK",
    "config value 'user.name' was not found",
    "[2024-09-18 08:44:32 (79)] STOP OK"
  ],
  timeStarted: 1726649001.8584,
  timeCompleted: 1726649072.4384,
  timeQueued: 1726649001.8572,
  packetId: "20240918-084322-3373cc95",
  parameters: {
    testParam1: 2,
    testParam2: false,
    testParam3: "hello"
  },
  queuePosition: null,
  runBy: "Super Admin"
};

export const mockTasksRunInfo: PageableBasicRunInfo = {
  content: [
    {
      taskId: "taskId1",
      packetGroupName: "packetGroupName1",
      status: "COMPLETE",
      branch: "master1",
      parameters: {
        testParam1: 2000,
        testParam2: false,
        testParam3: "hello"
      },
      runBy: "user1",
      commitHash: "1e0b69e099b28d0539c3cb6abfee328987e11d7a",
      packetId: "20240920-094300-78e4ae00",
      timeQueued: 1726825380.115
    },
    {
      taskId: "taskId2",
      packetGroupName: "packetGroupName2",
      status: "ERROR",
      branch: "master2",
      parameters: null,
      runBy: "user2",
      commitHash: "2e0b69e099b28d0539c3cb6abfee328987e11d7a",
      packetId: null,
      timeQueued: 1726775309.6623
    },
    {
      taskId: "taskId3",
      packetGroupName: "packetGroupName3",
      status: "PENDING",
      branch: "master3",
      parameters: null,
      runBy: "user3",
      commitHash: "3e0b69e099b28d0539c3cb6abfee328987e11d7a",
      packetId: null,
      timeQueued: 1726773690.4451
    },
    {
      taskId: "taskId4",
      packetGroupName: "packetGroupName4",
      status: "RUNNING",
      branch: "master4",
      parameters: null,
      runBy: "user4",
      commitHash: "4e0b69e099b28d0539c3cb6abfee328987e11d7a",
      packetId: null,
      timeQueued: 1726734163.4371
    }
  ],
  totalPages: 1,
  totalElements: 4,
  last: true,
  first: true,
  size: 50,
  number: 0,
  numberOfElements: 4
};
