import axios, { AxiosError, AxiosInstance } from "axios";
import {
    createAsyncThunk,
    AsyncThunkOptions,
    AsyncThunk,
} from "@reduxjs/toolkit";

const baseURL = "http://localhost:8080";

interface CustomAsyncThunkOptions<E>
    extends AsyncThunkOptions<void, { rejectValue: E }> {
    rejectValue: E;
}

interface API<T, E> {
    get(
        endpoint: string,
        asyncThunkConfig?: CustomAsyncThunkOptions<E>
    ): AsyncThunk<T, void, CustomAsyncThunkOptions<E>>;
}

export class CreateAsyncThunk<T, E> implements API<T, E> {
    private readonly type: string;
    private readonly axiosInstance: AxiosInstance;

    constructor(type: string) {
        this.type = type;
        this.axiosInstance = axios.create({ baseURL });
    }

    get = (
        endpoint: string,
        asyncThunkConfig?: CustomAsyncThunkOptions<E>
    ): AsyncThunk<T, void, CustomAsyncThunkOptions<E>> =>
        createAsyncThunk<T, void, CustomAsyncThunkOptions<E>>(
            this.type,
            async (_, thunkAPI) => {
                try {
                    const response = await this.axiosInstance.get<T>(endpoint);
                    return response.data;
                } catch (error) {
                    let errorMessage = null;
                    if (error instanceof AxiosError && error.response) {
                        errorMessage = error.response.data;
                    }
                    return thunkAPI.rejectWithValue(errorMessage);
                }
            },
            asyncThunkConfig
        );
}

export const api = <T, E>(type: string) => new CreateAsyncThunk<T, E>(type);
