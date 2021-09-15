<template>
    <div>
        <h1>{{ this.$route.params.user }}</h1>
        <el-divider></el-divider>
        <UserProfile :userId="this.$route.params.user"></UserProfile>
    </div>
</template>

<script>
import UserProfile from "../components/UserProfile.vue"

export default {
    name: "User",
    components: {
        UserProfile
    }
}
</script>