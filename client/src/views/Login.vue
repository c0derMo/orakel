<template>
    <div>
        <el-alert title="Incorrect credentials." v-if="error" type="error" />
        <el-input v-model="username" placeholder="Username" />
        <el-input v-model="password" placeholder="Password" show-password />
        <el-button type="success" icon="el-icon-check" circle @click="login"></el-button>
    </div>
</template>

<script>
import http from "../http";

export default {
    name: "Login",
    data() {
        return {
            username: "",
            password: "",
            error: false
        }
    },
    created() {
        this.activeMenu = "2";
        if(this.$store.getters.isLoggedIn) {
            this.$router.push("/");
        }
    },
    methods: {
        async login() {
            let response = await http.post("/api/users/login", {username: this.username, password: this.password});
            if(response.data.authenticated == true) {
                let token = response.data.token;
                let user = response.data.user;
                this.$store.dispatch('login', { token, user });
                this.$router.push("/");
            } else {
                this.username = "";
                this.password = "";
                this.error = true;
            }
        }
    }
}
</script>