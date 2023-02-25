import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Landing from "../views/Landing.vue";
import Tournament from "../views/Tournament.vue";
import Login from "../views/Login.vue";
import Profile from "../views/Profile.vue";
import Logout from "../views/Logout.vue";
import TournamentList from "../views/TournamentList.vue";
import User from "../views/User.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Landing,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/logout",
    component: Logout,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/tournament/:tid",
    component: Tournament,
  },
  {
    path: "/tournaments",
    component: TournamentList,
  },
  {
    path: "/user/:user",
    component: User,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
