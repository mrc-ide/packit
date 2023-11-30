import mockAxios from "../../../../mockAxios";
import { actions, PacketsMutationType } from "../../../app/store/packets/packetThunks";
import { saveCurrentUser } from "../../../localStorageManager";
import { Packet, PacketMetadata, PageablePackets, PaginationProps } from "../../../types";
import { mockPacketResponse } from "../../mocks";
import { expectThunkActionWith } from "../testHelper";

describe("packet actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.reset();
    saveCurrentUser({ token: "fake" });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const pageable = { pageNumber: 0, pageSize: 10 };

  it("should fetch packets as expected", async () => {
    const response = [mockPacketResponse];
    const dispatch = jest.fn();
    await expectThunkActionWith<PageablePackets | Packet[], PaginationProps>(
      dispatch,
      response,
      200,
      actions.fetchPackets(pageable),
      PacketsMutationType.GetPackets,
      "/packets?pageNumber=0&pageSize=10"
    );
  });

  it("should handle errors when fetching packets when response as error data", async () => {
    const dispatch = jest.fn();
    await expectThunkActionWith<PageablePackets | string, PaginationProps>(
      dispatch,
      "ERROR",
      400,
      actions.fetchPackets({ pageNumber: 0, pageSize: 10 }),
      PacketsMutationType.GetPackets,
      "/packets?pageNumber=0&pageSize=10"
    );
  });

  it("should fetch packets by ID as expected", async () => {
    const dispatch = jest.fn();
    await expectThunkActionWith<PacketMetadata | string, string>(
      dispatch,
      "PACKET",
      200,
      actions.fetchPacketById("123"),
      PacketsMutationType.GetPacket,
      "/packets/metadata/123"
    );
  });

  it("should handle fetch packetsById when errored", async () => {
    const dispatch = jest.fn();
    await expectThunkActionWith<PacketMetadata | string, string>(
      dispatch,
      "Error",
      500,
      actions.fetchPacketById("123"),
      PacketsMutationType.GetPacket,
      "/packets/metadata/123"
    );
  });
});
