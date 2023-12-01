import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../apiService";
import { PacketsMutationType } from "../../../app/store/packets/packetThunks";
import store from "../../../app/store/store";
import { saveCurrentUser } from "../../../localStorageManager";
import { CustomAsyncThunkOptions, Packet, PacketMetadata, PaginationProps } from "../../../types";
import { login } from "../IntegrationTest";

describe("packets integration", () => {
  beforeEach(async () => {
    const user = await login();
    saveCurrentUser(user);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const pageable = { pageNumber: 0, pageSize: 10 };

  it("can fetch pageable packets", async () => {
    const dispatch = jest.fn();
    const fetchThunk = createAsyncThunk<Packet[], PaginationProps, CustomAsyncThunkOptions>(
      PacketsMutationType.GetPackets,
      async (prop, thunkAPI) => api(store).get("/packets?pageNumber=0&pageSize=10", thunkAPI)
    );

    const fetchPacketsAction = fetchThunk(pageable);

    await fetchPacketsAction(dispatch, jest.fn(), jest.fn());

    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "GetPackets/pending",
      payload: undefined
    });
    const result = dispatch.mock.calls[1][0];
    expect(result["type"]).toBe("GetPackets/fulfilled");
    expect(result["payload"]["size"]).toBe(10);
    expect(result["payload"]["totalPages"]).toBe(2);
    expect(result["payload"]["content"]).toHaveLength(10);
  });

  it("can fetch packetById", async () => {
    const dispatch = jest.fn();
    const fetchThunk = createAsyncThunk<PacketMetadata, string, CustomAsyncThunkOptions>(
      PacketsMutationType.GetPacket,
      async (prop, thunkAPI) => api(store).get("/packets/metadata/20230427-150755-2dbede93", thunkAPI)
    );

    const fetchPacketsAction = fetchThunk("20230427-150755-2dbede93");

    await fetchPacketsAction(dispatch, jest.fn(), jest.fn());

    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "GetPacket/pending",
      payload: undefined
    });

    const result = dispatch.mock.calls[1][0];
    expect(result["type"]).toBe("GetPacket/fulfilled");
    expect(result["payload"].id).toBe("20230427-150755-2dbede93");
    expect(result["payload"].name).toBe("explicit");
  });
});
