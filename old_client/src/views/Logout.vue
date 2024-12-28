<template>
  <span></span>
</template>

<script>
export default {
  name: "Logout",
  created() {
    this.$store.dispatch("logout");
    this.$router.push("/");
  },
};
</script>
