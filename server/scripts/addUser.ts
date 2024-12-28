import consola from "consola";
import bcrypt from "bcrypt";
import { DatabaseController } from "../controller/databaseController";
import { User } from "../model/User";

async function addUser() {
    const db = new DatabaseController("./orakel.db");
    await db.connect();

    const username = await consola.prompt("Please enter the username:", { type: "text" });
    const password = await consola.prompt("Please enter the password:", { type: "text" });

    const user = new User();
    user.username = username;
    user.passwordHash = await bcrypt.hash(password, 10);
    user.permissions = [];
    await user.save();
    consola.success("User created.");

    await db.disconnect();
}

void addUser();