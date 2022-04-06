import { connect, disconnect } from "../database/mongodb/database";
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

(async() => {
    const db = connect();
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Update (D)isplayName, Password-(H)ash or (P)ermissions?", (opt) => {
        if(opt.toLowerCase() != "d" && opt.toLowerCase() != "h" && opt.toLowerCase() != "p") return;
        rl.question("Enter the username to change: ", async (originalUser) => {
            let user = await db.UserModel.findOne({username: originalUser});
            if(!user) return;
            rl.question("Enter the new value: ", async (val) => {
                if(opt.toLowerCase() == "h") {
                    val = await bcrypt.hash(val, 10);
                }
                switch(opt.toLowerCase()) {
                    case 'd':
                        user.displayname = val;
                        break;
                    case 'h':
                        user.passwordHash = val;
                        break;
                    case 'p':
                        user.permissions = parseInt(val);
                        break;
                }
                await user.save();
                console.log("Done!");
                rl.close();
            });
        })
    });
})();
