<template>
    <div>
        <h1>{{ this.$store.getters.getUser.username }}</h1>
        <el-divider></el-divider>
        <UserProfile :userId="this.$store.getters.getUser.username"></UserProfile>
    </div>
</template>

<script>
import UserProfile from "../components/UserProfile.vue"

export default {
    name: "Profile",
    components: {
        UserProfile
    },
    created() {
        if(!this.$store.getters.isLoggedIn) {
            this.$router.push("/login");
        }  
    }
}
</script>