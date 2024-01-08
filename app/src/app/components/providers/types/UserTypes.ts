export interface UserState {
  token: string;
  exp: number;
  displayName: string;
  userName: string;
}
export interface UserProviderState {
  user: UserState | null;
  setUser: (jwt: string) => void;
  removeUser: () => void;
  requestedUrl: string | null;
  setRequestedUrl: (url: string | null) => void;
  loggingOut: boolean;
  setLoggingOut: (value: boolean) => void;
}
