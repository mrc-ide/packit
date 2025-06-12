export const APPLICATION_JSON = "application/json";
export class PackitApiUtils {
  private readonly apiUrl: string;

  constructor(packitBaseUrl: string) {
    this.apiUrl = packitBaseUrl === "http://localhost:3000/" ? "http://localhost:8080" : `${packitBaseUrl}/packit/api`;
  }

  async get(url: string, accept = APPLICATION_JSON, accessToken = null) {
    const headers = {
      Accept: accept
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return await fetch(`${this.apiUrl}${url}`, {
      headers
    });
  }

  async post(url: string, data: any, contentType = APPLICATION_JSON, accept = APPLICATION_JSON) {
    return await fetch(`${this.apiUrl}${url}`, {
      method: "POST",
      ...(data && { body: JSON.stringify(data) }),
      headers: {
        Accept: accept,
        "Content-Type": contentType
      }
    });
  }
}
