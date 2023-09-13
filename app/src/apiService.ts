import axios, {AxiosError, AxiosInstance} from "axios";
import {Error} from "./types";
import appConfig from "./config/appConfig";
import {validateToken} from "./helpers";

let store: any;

export const injectStore = (_store: any) => {
    store = _store;
};

const baseURL = appConfig.apiUrl();

interface API {
    get<T>(endpoint: string, thunkAPI: any): Promise<T>;

    postAndReturn<T>(endpoint: string, data: any, thunkAPI: any): Promise<T>;
}

export class ApiService implements API {
    private readonly axiosInstance: AxiosInstance;
    private readonly headers: any;

    private ignoreAuthorization = false;

    constructor(axiosInstance = axios.create({baseURL})) {
        this.headers = {
            "Content-Type": "application/json",
        };

        this.addAuthorizationHeader(axiosInstance);

        this.axiosInstance = axiosInstance;
    }

    addAuthorizationHeader = (axiosInstance: AxiosInstance) => {
        //TODO validate for expired token
        axiosInstance.interceptors.request.use(config => {
            if (validateToken(store.getState().login.token)) {
                config.headers.authorization =
                    `Bearer ${store.getState().login.token || localStorage.getItem("token")}`;
            }
            return config;
        });
    };

    private handleErrorResponse = (error: AxiosError) => {
        let errorMessage = {error: {detail: "Could not parse API response", error: "error"}};
        if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data as Error;
        }
        return errorMessage;
    };

    get<T>(endpoint: string, thunkAPI: any): Promise<T> {
        return this.axiosInstance.get(endpoint, {headers: this.headers})
            .then(response => thunkAPI.fulfillWithValue(response.data))
            .catch((error: AxiosError) => {
                const message = this.handleErrorResponse(error);
                return thunkAPI.rejectWithValue(message);
            });
    }

    postAndReturn<T>(endpoint: string, data: any, thunkAPI: any): Promise<T> {
        return this.axiosInstance.post(endpoint, data, {headers:this.headers})
            .then(response => thunkAPI.fulfillWithValue(response.data))
            .catch((error: AxiosError) => {
                const message = this.handleErrorResponse(error);
                return thunkAPI.rejectWithValue(message);
            });
    }
}

export const api = new ApiService();
