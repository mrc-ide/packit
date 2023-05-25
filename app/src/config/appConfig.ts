interface AppConfig {
    apiUrl: () => string
}

const devConfig: AppConfig = {
    apiUrl: () => "http://localhost:8080"
};

const prodConfig: AppConfig = {
    apiUrl: () => `https://${window.location.host}/packit/api`,
};

let appConfig = devConfig;

if (process.env.NODE_ENV == "production") {
    appConfig = prodConfig;
}

export default appConfig;
