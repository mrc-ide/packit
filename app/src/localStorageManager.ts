import {CurrentUser} from "./types";

export const CURRENT_USER = "user";

export const getCurrentUser = (): CurrentUser => {
    const user = localStorage.getItem(CURRENT_USER);
    return user ? JSON.parse(user) : null;
};

export const saveCurrentUser = (user: CurrentUser) => {
    localStorage.removeItem(CURRENT_USER);
    localStorage.setItem(CURRENT_USER, JSON.stringify(user));
};
