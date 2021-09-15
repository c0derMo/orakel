<template>
    <div>
        <span>{{ this.$store.getters.getUser.displayName }}</span>
        <el-divider></el-divider>
        Permissions: <span>{{ computedPermissions }}</span><br>
    </div>
</template>

<script>
export default {
    name: "Profile",
    created() {
        if(!this.$store.getters.isLoggedIn) {
            this.$router.push("/login");
        }  
    },
    computed: {
        computedPermissions() {
            let p = [];
            for(let perm in this.$store.getters.getUser.permissions) {
                if(this.$store.getters.getUser.permissions[perm] == true) {
                    switch(perm) {
                        case "ROOT":
                            p.push("Root Administrator");
                            break;
                        case "ADMINISTRATOR":
                            p.push("Administrator");
                            break;
                    }
                }
            }
            return p.join(", ");
        }
    }
}
</script>