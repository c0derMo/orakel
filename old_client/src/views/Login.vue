<template>
  <v-card max-width="500px" class="mx-auto mt-10">
    <v-card-header>
      <v-card-header-text>
        <v-card-title>Login</v-card-title>
      </v-card-header-text>
    </v-card-header>
    <v-card-text>
      <v-alert v-if="error" color="error"> Invalid credentials. </v-alert>
      <!-- TODO: Update to real v-inputs again -->
      <input
        type="text"
        v-model="username"
        placeholder="Username"
      /><br /><br />
      <input type="password" v-model="password" placeholder="Password" />
    </v-card-text>
    <v-card-actions>
      <v-btn type="success" icon="mdi-check-bold" @click="login"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import http from "../http";

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      error: false,
    };
  },
  created() {
    if (this.$store.getters.isLoggedIn) {
      this.$router.push("/");
    }
  },
  methods: {
    async login() {
      let response = await http.post("/api/users/login", {
        username: this.username,
        password: this.password,
      });
      if (response.data.authenticated == true) {
        let token = response.data.token;
        let user = response.data.user;
        this.$store.dispatch("login", { token, user });
        this.$router.push("/");
      } else {
        this.username = "";
        this.password = "";
        this.error = true;
      }
    },
  },
};
</script>

<style>
input {
  color: white;
  width: 100%;
}
</style>
