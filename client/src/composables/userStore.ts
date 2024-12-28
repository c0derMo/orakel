import { defineStore } from "pinia";
import { setAuthToken } from "./http";
import type { IPublicUser } from "@shared/interfaces/IUser";

export const useUserStore = defineStore("user", {
    state: () => ({
        token: "",
        user: null as IPublicUser | null,
    }),
    getters: {
        isLoggedIn: (state) => state.token != "",
    },
    actions: {
        login(token: string, user: IPublicUser) {
            this.token = token;
            this.user = user;
            setAuthToken(this.token);
        },
    },
});
