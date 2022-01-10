<template>
  <v-row>
    <v-col md="8" offset="2">
      <h1>{{ this.$store.getters.getUser.username }}</h1>
      <v-divider></v-divider>
      <UserProfile :userId="this.$store.getters.getUser.username"></UserProfile>
    </v-col>
  </v-row>
</template>

<script>
import UserProfile from "../components/UserProfile.vue";

export default {
  name: "Profile",
  components: {
    UserProfile,
  },
  created() {
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push("/login");
    }
  },
};
</script>
