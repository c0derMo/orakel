<template>
    <div>
        <el-menu
          mode="horizontal"
          :default-active="this.$route.path"
          @select="menuSelect"
        >
            <el-menu-item index="/">Orakel</el-menu-item>
            <el-menu-item index="/tournaments">Browse</el-menu-item>
            <el-menu-item class="dock-right" v-if="!this.$store.getters.isLoggedIn" index="/login">Login</el-menu-item>
            <el-sub-menu class="dock-right" v-else>
                <template #title>Welcome {{ this.$store.getters.getUser.displayName }}</template>
                <el-menu-item index="/profile">Profile</el-menu-item>
                <el-menu-item index="/logout">Logout</el-menu-item>
            </el-sub-menu>
        </el-menu>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "App",
    methods: {
        menuSelect(idx) {
            this.$router.push(idx);
        }
    }
}
</script>

<style scoped>
    .el-menu--horizontal {
        display: block;
    }
    .el-menu--horizontal > .el-menu-item.dock-right {
        float: right;
    }
    .el-menu--horizontal > .el-sub-menu.dock-right {
        float: right;
    }
</style>