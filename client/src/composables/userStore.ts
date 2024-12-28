import { defineStore } from "pinia";
import { setAuthToken } from "./http";

// TODO: Move to shared file
interface User {
    username: string;
}

export const useUserStore = defineStore("user", {
    state: () => ({
        token: "",
        user: null as User | null,
    }),
    getters: {
        isLoggedIn: (state) => state.token != "",
    },
    actions: {
        login(token: string, user: User) {
            this.token = token;
            this.user = user;
            setAuthToken(this.token);
        },
    },
});
