import mockAxios from "../../../../mockAxios";
import {mockPacketResponse} from "../../mocks";
import {actions, PacketsMutationType} from "../../../app/store/packets/thunks";
import { expectThunkActionWith } from "../testHelper";
import {Packet, PacketMetadata, PageablePackets} from "../../../types";

describe("packet actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    const pageable = {pageNumber: 0, pageSize: 10}

    it("should fetch packets as expected", async () => {
        const response = [mockPacketResponse];
        const dispatch = jest.fn();
        await expectThunkActionWith<PageablePackets | Packet[], Record<string, any>>(
            dispatch,
            response,
            200,
            actions.fetchPackets(pageable),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when response as error data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<PageablePackets | string, Record<string, any>>(
            dispatch,
            "ERROR",
            400,
            actions.fetchPackets({pageNumber: 0, pageSize: 10}),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when empty response data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<null | PageablePackets, Record<string, any>>(
            dispatch,
            null,
            400,
            actions.fetchPackets(pageable),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should fetch packets by ID as expected", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<PacketMetadata | string, string>(
            dispatch,
            "PACKET",
            200,
            actions.fetchPacketById("123"),
            PacketsMutationType.GetPacket,
            "/packets/metadata/123");
    });

    it("should handle fetch packetsById when errored", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<PacketMetadata | string , string>(
            dispatch,
            "Error",
            500,
            actions.fetchPacketById("123"),
            PacketsMutationType.GetPacket,
            "/packets/metadata/123");
    });
});
