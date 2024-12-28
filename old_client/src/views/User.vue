<template>
  <v-row>
    <v-col md="8" offset="2">
      <h1>{{ this.$route.params.user }}</h1>
      <v-divider></v-divider>
      <UserProfile :userId="this.$route.params.user"></UserProfile>
    </v-col>
  </v-row>
</template>

<script>
import UserProfile from "../components/UserProfile.vue";

export default {
  name: "User",
  components: {
    UserProfile,
  },
};
</script>
