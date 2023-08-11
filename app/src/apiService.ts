import axios, {AxiosError, AxiosInstance} from "axios";
import {Error} from "./types";
import appConfig from "./config/appConfig";

const baseURL = appConfig.apiUrl();

interface API {
    get<T>(endpoint: string, thunkAPI: any): Promise<T>;
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

    get<T>(endpoint: string, thunkAPI: any): Promise<T> {
        return this.axiosInstance.get(endpoint)
            .then(response => thunkAPI.fulfillWithValue(response.data))
            .catch((error: AxiosError) => {
                const message = this.handleErrorResponse(error);
                return thunkAPI.rejectWithValue(message);
            });
    }
}

export const api = new ApiService();
