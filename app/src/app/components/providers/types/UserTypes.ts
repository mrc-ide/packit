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
}
