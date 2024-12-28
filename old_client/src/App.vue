<template>
  <v-app theme="dark">
    <v-app-bar app>
      <v-app-bar-title
        ><a @click="menuSelect" index="/">Orakel</a></v-app-bar-title
      >
      <v-btn @click="menuSelect" text index="/tournaments">Browse</v-btn>

      <v-spacer></v-spacer>

      <v-divider inset vertical></v-divider>

      <v-btn
        @click="menuSelect"
        v-if="!this.$store.getters.isLoggedIn"
        index="/login"
        >Login</v-btn
      >
      <div v-else>
        <v-btn @click="menuSelect" index="/profile"
          >Welcome {{ this.$store.getters.getUser.username }}</v-btn
        >
        <v-btn @click="menuSelect" index="/logout">Logout</v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
  methods: {
    menuSelect(elem) {
      this.$router.push(elem.target.getAttribute("index"));
    },
  },
};
</script>
