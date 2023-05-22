import axios, {AxiosError, AxiosInstance} from "axios";
import {
    createAsyncThunk,
    AsyncThunkOptions,
    AsyncThunk, SerializedError,
} from "@reduxjs/toolkit";
import {RejectedErrorValue} from "./types";
import config from "./config/appConfig";

const baseURL = config.apiUrl();

interface CustomAsyncThunkOptions extends AsyncThunkOptions<void, RejectedErrorValue> {
    rejectValue: SerializedError
}

interface API {
    get<T>(mutationType: string, endpoint: string): AsyncThunk<T, void, CustomAsyncThunkOptions>;
}

export class ApiService implements API {
    private readonly axiosInstance: AxiosInstance;

    constructor(axiosInstance = axios.create({baseURL})) {
        this.axiosInstance = axiosInstance;
    }

    get<T>(mutationType: string, endpoint: string): AsyncThunk<T, void, CustomAsyncThunkOptions> {
        return createAsyncThunk<T, void, CustomAsyncThunkOptions>(
            mutationType,
            (_, thunkAPI) =>
                this.axiosInstance.get<T>(endpoint)
                    .then(response => thunkAPI.fulfillWithValue(response.data))
                    .catch(error => {
                        let errorMessage = {message: "Could not parse API response"};
                        if (error instanceof AxiosError && error.response) {
                            errorMessage = error.response.data;
                        }

                        return thunkAPI.rejectWithValue(errorMessage);
                    }));
    }
}

export const api = new ApiService();
