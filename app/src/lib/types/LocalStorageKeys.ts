import appConfig from "../../config/appConfig";

const getLocalStorageKey = (key: string) => {
  const ns = appConfig.appNamespace();
  return ns ? `${ns}.${key}` : key;
};

export const LocalStorageKeys = {
  AUTH_CONFIG: getLocalStorageKey("authConfig"),
  RUNNER_CONFIG: getLocalStorageKey("runnerConfig"),
  USER: getLocalStorageKey("user"),
  THEME: "ui-theme",
  REQUESTED_URL: getLocalStorageKey("requestedUrl")
};
