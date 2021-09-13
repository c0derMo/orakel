<template>
    <div>
        <el-menu
          mode="horizontal"
          :default-active="currentActivePage"
          @select="menuSelect"
        >
            <el-menu-item index="1">Orakel</el-menu-item>
            <el-menu-item index="2">
                <el-input placeholder="Tournament ID" v-model="tournamentId" @change="findTournament"></el-input>
            </el-menu-item>
            <el-menu-item class="dock-right" v-if="!this.$store.getters.isLoggedIn" index="3">Login</el-menu-item>
            <el-menu-item class="dock-right" v-else index="4">Welcome {{ this.$store.getters.getUser.displayName }}</el-menu-item>
        </el-menu>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            tournamentId: "",
            currentActivePage: "0"
        }
    },
    created() {
        this.$watch(
            () => this.$route.path,
            () => { this.updateMenu() },
            { immediate: true }
        )
    },
    methods: {
        menuSelect(idx) {
            switch(idx) {
                case "1":
                    this.$router.push("/");
                    break;
                case "3":
                    this.$router.push("/login");
                    break;
                case "4":
                    this.$store.dispatch("logout");
                    break;
            }
        },
        findTournament(id) {
            this.$router.push("/tournament/" + id);
        },
        updateMenu() {
            let routesToIndexes = {
                "/": "1",
                "/tournament/.*": "2",
                "/login": "3"
            }
            for(let key in routesToIndexes) {
                if(this.$route.path.match(key)) this.currentActivePage = routesToIndexes[key];
            }
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
</style>