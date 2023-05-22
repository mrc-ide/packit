interface AppConfig {
    apiUrl: () => string
}

const devConfig: AppConfig = {
    apiUrl: () => "http://localhost:8080"
};

const prodConfig: AppConfig = {
    apiUrl: () => `https://${window.location.host}/packit/api`,
};

let config = devConfig;

if (process.env.NODE_ENV == "production") {
    config = prodConfig;
}

export default config;
