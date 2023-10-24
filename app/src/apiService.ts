import axios, {AxiosError, AxiosInstance} from "axios";
import {Error} from "./types";
import appConfig from "./config/appConfig";
import {validateToken} from "./helpers";
import {removeCurrentUser, getCurrentUser} from "./localStorageManager";
import {Store} from "@reduxjs/toolkit";

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
    private readonly injectedStore: any;

    private ignoreAuthorization = false;

    constructor(injectStore: Store, axiosInstance = axios.create({baseURL})) {
        this.headers = {
            "Content-Type": "application/json",
        };

        this.addAuthorizationHeader(axiosInstance);

        this.axiosInstance = axiosInstance;
        this.injectedStore = injectStore;
    }

    addAuthorizationHeader = (axiosInstance: AxiosInstance) => {

        axiosInstance.interceptors.request.use(config => {
            if (validateToken(getCurrentUser() || this.injectedStore.getState().login.user)) {
                config.headers.authorization = `Bearer ${getCurrentUser().token
                || this.injectedStore.getState().login.user.token}`;
            }
            return config;
        });
    };

    private handle401Error = (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            removeCurrentUser();
            window.location.assign("/login");
        }
    };

    private handleErrorResponse = (error: AxiosError) => {

        this.handle401Error(error);

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

export const api = (initialStore: Store = store) => new ApiService(initialStore);
