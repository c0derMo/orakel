import { ofetch, type $Fetch } from "ofetch";
import { useUserStore } from "./userStore";

interface APIInterface {
    fetch: $Fetch;
}

const baseURL = "http://localhost:3000";

export function useAPI(): APIInterface {
    const authToken = useUserStore().token;

    return {
        fetch: ofetch.create({
            baseURL: baseURL,
            headers:
                authToken != ""
                    ? {
                          Authorization: `Bearer ${authToken}`,
                      }
                    : undefined,
        }),
    };
}
