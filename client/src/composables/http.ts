import { ofetch, type $Fetch } from "ofetch";

interface APIInterface {
    fetch: $Fetch;
}

const baseURL = "http://localhost:3000";
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

export function useAPI(): APIInterface {
    return {
        fetch: ofetch.create({
            baseURL: baseURL,
            headers:
                authToken != null
                    ? {
                          Authorization: `Bearer ${authToken}`,
                      }
                    : undefined,
        }),
    };
}
