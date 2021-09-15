<template>
    <div>
        {{ this.userData.rank }}<br>
        Joined: {{ this.userData.joined }}<br>
        <div v-if="userData.adminOfTournaments.length > 0">
            <el-divider>Tournaments organized:</el-divider>
            <ul>
                <li v-for="tourney in userData.adminOfTournaments" :key="tourney">
                {{tourney}}
                </li>
            </ul>
        </div>
        <div v-if="computedPermissions != ''">
            <el-divider>Permissions</el-divider>
            Permissions: <span>{{ computedPermissions }}</span>
        </div>
    </div>
</template>

<script>
import http from "../http";

export default {
    name: "UserProfile",
    data() {
        return {
            userData: {
                adminOfTournaments: []
            },
            computedPermissions: ''
        }
    },
    props: {
        userId: String
    },
    async created() {
        let response = await http.get("/api/users/get/" + this.userId);
        this.userData = response.data;
        let p = [];
        for(let perm in this.userData.permissions) {
            if(this.userData.permissions[perm] == true) {
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
        this.computedPermissions = p.join(", ");
    },
    watch: {
        async userId() {
            let response = await http.get("/api/users/get/" + this.userId);
            this.userData = response.data;
            let p = [];
            for(let perm in this.userData.permissions) {
                if(this.userData.permissions[perm] == true) {
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
            this.computedPermissions = p.join(", ");
        }
    }
}
</script>