interface AppConfig {
  apiUrl: () => string;
  appNamespace: () => string | null;
}

// use REACT_APP_SUB_URL_DEPTH = 0 for testing
const getUrlSubPath = () => {
  if (process.env.REACT_APP_SUB_URL_DEPTH === undefined) {
    throw new Error("REACT_APP_SUB_URL_DEPTH must be set");
  }

  const numericDepth = parseFloat(process.env.REACT_APP_SUB_URL_DEPTH);
  if (!Number.isInteger(numericDepth)) {
    throw new Error("REACT_APP_SUB_URL_DEPTH must be an integer");
  }

  return numericDepth === 0 ? null : window.location.pathname.split("/").slice(1, 1 + numericDepth);
};

const appConfig: AppConfig = {
  apiUrl: () => {
    const subPath = getUrlSubPath();
    // used for testing
    if (!subPath) return "http://localhost:8080";
    return `/${subPath.join("/")}/packit/api`;
  },
  appNamespace: () => {
    const subPath = getUrlSubPath();
    // used for testing
    if (!subPath) return null;
    return subPath.join("-");
  }
};

export default appConfig;
export const githubAuthEndpoint = (config: AppConfig) => `${config.apiUrl()}/oauth2/authorization/github`;
export const publicUrl = () => {
  const subPath = getUrlSubPath();
  if (!subPath) return "/";
  return "/" + subPath.join("/");
};
