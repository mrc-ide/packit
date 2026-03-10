export interface UserState {
  token: string;
  exp: number;
  displayName: string;
  userName: string;
}
export interface UserProviderState {
  user: UserState | null;
  authorities?: string[];
  isLoading: boolean;
  setUser: (jwt: string) => void;
  removeUser: () => void;
}

export interface RedirectOnLoginProviderState {
  requestedUrl: string | null;
  setRequestedUrl: (url: string | null) => void;
  loggingOut: boolean;
  setLoggingOut: (value: boolean) => void;
}
