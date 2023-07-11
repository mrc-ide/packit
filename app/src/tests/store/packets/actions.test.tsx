import mockAxios from "../../../../mockAxios";
import {mockPacketResponse} from "../../mocks";
import {actions, PacketsMutationType} from "../../../app/store/packets/thunks";
import { expectThunkActionWith } from "../testHelper";
import {Packet, PacketMetadata} from "../../../types";

describe("packet actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    it("should fetch packets as expected", async () => {
        const response = [mockPacketResponse];
        const dispatch = jest.fn();
        await expectThunkActionWith<Packet[], void>(
            dispatch,
            response,
            200,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when response as error data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<Packet[] | string, void>(
            dispatch,
            "ERROR",
            400,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when empty response data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<null | Packet[], void>(
            dispatch,
            null,
            400,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should fetch packets by ID as expected", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<PacketMetadata | string, string>(
            dispatch,
            "PACKET",
            200,
            actions.fetchPacketMetadataById("123"),
            PacketsMutationType.GetPacket,
            "/packets/metadata/123");
    });

    it("should handle fetch packetsById when errored", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<PacketMetadata | string , string>(
            dispatch,
            "Error",
            500,
            actions.fetchPacketMetadataById("123"),
            PacketsMutationType.GetPacket,
            "/packets/metadata/123");
    });

    it("should fetch fileById as expected", async () => {
        const dispatch = jest.fn();
        const mockBlobResponse = new Blob(["Mock data"], { type: "text/html" });
        await expectThunkActionWith<Blob | string, string>(
            dispatch,
            mockBlobResponse,
            200,
            actions.fetchFileByHash("123"),
            PacketsMutationType.GetFile,
            "/packets/file/123");
    });

    it("should handle fetch fileById when errored", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith<string , string>(
            dispatch,
            "Error",
            500,
            actions.fetchFileByHash("123"),
            PacketsMutationType.GetFile,
            "/packets/file/123");
    });
});
