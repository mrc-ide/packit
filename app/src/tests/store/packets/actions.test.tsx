import mockAxios from "../../../../mockAxios";
import {mockPacketResponse} from "../../mocks";
import {actions, PacketsMutationType} from "../../../app/store/packets/thunks";
import { expectThunkActionWith } from "../actionsTestHelper";

describe("packet actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    it("should fetch packets as expected", async () => {
        const response = [mockPacketResponse];
        const dispatch = jest.fn();
        await expectThunkActionWith(
            dispatch,
            response,
            200,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when response as error data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith(
            dispatch,
            "ERROR",
            400,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });

    it("should handle errors when fetching packets when empty response data", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith(
            dispatch,
            null,
            400,
            actions.fetchPackets(),
            PacketsMutationType.GetPackets,
            "/packets");
    });


    it("should fetch packets  by ID as expected", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith(
            dispatch,
            "PACKET",
            200,
            actions.fetchPacketById("123"),
            PacketsMutationType.GetPacket,
            "/packets/123");
    });

    it("should handle fetch packets by ID error", async () => {
        const dispatch = jest.fn();
        await expectThunkActionWith(
            dispatch,
            "Error",
            500,
            actions.fetchPacketById("123"),
            PacketsMutationType.GetPacket,
            "/packets/123");
    });
});
