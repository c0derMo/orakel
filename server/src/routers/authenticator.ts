import { Router }  from "express"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { UserModel } from "../database/schemas/users";

const secretToken = process.env.TOKENSECRET;

const router = Router();

router.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let user = await UserModel.findOne({username: username});
    if(!user) {
        res.json({"authenticated": false});
        return;
    }
    let match = await bcrypt.compare(password, user.passwordHash);

    if(match) {
        let userObj = {
            "displayName": user.displayname,
            "permissions": user.permissions
        }
        let token = jwt.sign({
            userId: user._id
        },
        secretToken, {
            expiresIn: '7d'
        })
        res.json({"authenticated": true, "user": userObj, "token": token});
    } else {
        res.json({"authenticated": false});
    }
})

export default router;