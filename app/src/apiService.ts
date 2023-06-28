import axios, {AxiosError, AxiosInstance} from "axios";
import {
    createAsyncThunk,
    AsyncThunkOptions,
    AsyncThunk,
} from "@reduxjs/toolkit";
import {RejectedErrorValue, Error} from "./types";
import appConfig from "./config/appConfig";

const baseURL = appConfig.apiUrl();

interface CustomAsyncThunkOptions extends AsyncThunkOptions<void, RejectedErrorValue> {
    rejectValue: Error
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
                        let errorMessage = {error: {detail: "Could not parse API response", error: "error"}};
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
