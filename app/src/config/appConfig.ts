interface AppConfig {
  apiUrl: () => string;
  appNamespace: () => string | null;
}

const appConfig: AppConfig = {
  apiUrl: () => {
    if (process.env.REACT_APP_PACKIT_API_URL === undefined) {
      throw new Error("An API URL must be configured");
    } else {
      return process.env.REACT_APP_PACKIT_API_URL;
    }
  },
  appNamespace: () => {
    if (!process.env.REACT_APP_PACKIT_NAMESPACE) {
      return null;
    } else {
      return process.env.REACT_APP_PACKIT_NAMESPACE;
    }
  }
};

export default appConfig;
export const githubAuthEndpoint = (config: AppConfig) => `${config.apiUrl()}/oauth2/authorization/github`;
