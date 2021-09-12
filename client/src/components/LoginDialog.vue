<template>
    <div>
        <div v-if="!this.$store.getters.isLoggedIn">
            <el-input v-model="username" placeholder="Username" />
            <el-input v-model="password" placeholder="Password" show-password />
            <el-button type="success" icon="el-icon-check" circle @click="login"></el-button>
        </div>
        <div v-else>
            <span>Welcome, {{ this.$store.getters.getUser.displayName }}</span>
            <span>Your permissions: {{ this.$store.getters.getUser.permissions }}</span>
            <el-button type="success" icon="el-icon-check" circle @click="logout"></el-button>
        </div>
    </div>
</template>

<script>
import http from "../http-common";

export default {
    name: "LoginDialog",
    data() {
        return {
            username: "",
            password: ""
        }
    },
    methods: {
        async login() {
            let response = await http.post("/login", {username: this.username, password: this.password});
            console.log(response);
            if(response.data.authenticated == true) {
                let token = response.data.token;
                let user = response.data.user;
                this.$store.dispatch('login', { token, user });
            } else {
                this.username = "";
                this.password = "";
            }
        },
        async logout() {
            this.$store.dispatch('logout');
        }
    }
}
</script>