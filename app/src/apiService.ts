import axios, {AxiosError, AxiosInstance} from "axios";
import {
    createAsyncThunk,
    AsyncThunkOptions,
    AsyncThunk,
} from "@reduxjs/toolkit";
import {RejectedErrorValue, Error} from "./types";
import appConfig from "./config/appConfig";

const baseURL = appConfig.apiUrl();

export interface CustomAsyncThunkOptions extends AsyncThunkOptions<void, RejectedErrorValue> {
    rejectValue: Error
}

interface API {
    get<T, V>(mutationType: string, endpoint: string): AsyncThunk<T, V, CustomAsyncThunkOptions>;
    getx<T>(endpoint: string, thunkAPI: any): any;
}

export class ApiService implements API {
    private readonly axiosInstance: AxiosInstance;

    constructor(axiosInstance = axios.create({baseURL})) {
        this.axiosInstance = axiosInstance;
    }

    private handleErrorResponse = (error: AxiosError) => {
        let errorMessage = {error: {detail: "Could not parse API response", error: "error"}};
        if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data as Error;
        }
        return errorMessage;
    };

    get<T, V>(mutationType: string, endpoint: string): AsyncThunk<T, V, CustomAsyncThunkOptions> {
        return createAsyncThunk<T, V, CustomAsyncThunkOptions>(
            mutationType,
            (args, thunkAPI) =>
                this.axiosInstance.get<T>(this.getEndpoint<V>(endpoint, args))
                    .then(response => thunkAPI.fulfillWithValue(response.data))
                    .catch((error: AxiosError) => {
                        const message = this.handleErrorResponse(error);
                        return thunkAPI.rejectWithValue(message);
                    }));
    }


    getx<T>(endpoint: string, thunkAPI: any): any {
        return this.axiosInstance.get(endpoint)
            .then(response => thunkAPI.fulfillWithValue(response.data))
            .catch((error: AxiosError) => {
                const message = this.handleErrorResponse(error);
                return thunkAPI.rejectWithValue(message);
            });
    }

    private getEndpoint<V>(endpoint: string, args: V): string {
        return args ? `${endpoint}/${args}` : endpoint;
    }
}

export const api = new ApiService();
