<template>
    <div id="app">
        <el-menu
          mode="horizontal"
          :default-active="this.$route.path"
          @select="menuSelect"
        >
            <el-menu-item index="/">Orakel</el-menu-item>
            <el-menu-item index="/tournaments">Browse</el-menu-item>
            <el-menu-item class="dock-right" v-if="!this.$store.getters.isLoggedIn" index="/login">Login</el-menu-item>
            <el-sub-menu class="dock-right" index="/profile" v-else>
                <template #title>Welcome {{ this.$store.getters.getUser.username }}</template>
                <el-menu-item index="/profile">Profile</el-menu-item>
                <el-menu-item index="/logout">Logout</el-menu-item>
            </el-sub-menu>
        </el-menu>
        <el-row>
            <el-col :span="16" :offset="4"><router-view></router-view></el-col>
        </el-row>
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

    #app {
        font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    }
</style>