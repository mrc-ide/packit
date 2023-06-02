import axios, {AxiosError, AxiosInstance} from "axios";
import {
    createAsyncThunk,
    AsyncThunkOptions,
    AsyncThunk, SerializedError,
} from "@reduxjs/toolkit";
import {RejectedErrorValue} from "./types";
import appConfig from "./config/appConfig";

const baseURL = appConfig.apiUrl();

interface CustomAsyncThunkOptions extends AsyncThunkOptions<void, RejectedErrorValue> {
    rejectValue: SerializedError
}

interface API {
    get<T, V>(mutationType: string, endpoint: string): AsyncThunk<T, V, CustomAsyncThunkOptions>;
}

export class ApiService implements API {
    private readonly axiosInstance: AxiosInstance;

    constructor(axiosInstance = axios.create({baseURL})) {
        this.axiosInstance = axiosInstance;
    }

    get<T, V>(mutationType: string, endpoint: string): AsyncThunk<T, V, CustomAsyncThunkOptions> {
        return createAsyncThunk<T, V, CustomAsyncThunkOptions>(
            mutationType,
            (args, thunkAPI) =>
                this.axiosInstance.get<T>(this.getEndpoint<V>(endpoint, args))
                    .then(response => thunkAPI.fulfillWithValue(response.data))
                    .catch(error => {
                        let errorMessage = {message: "Could not parse API response"};
                        if (error instanceof AxiosError && error.response) {
                            errorMessage = error.response.data;
                        }

                        return thunkAPI.rejectWithValue(errorMessage);
                    }));
    }

    private getEndpoint<V>(endpoint: string, args: V): string {
        return args ? `${endpoint}/${args}` : endpoint;
    }
}

export const api = new ApiService();
