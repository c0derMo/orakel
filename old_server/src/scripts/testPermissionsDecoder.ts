import { decodePermissions, Permissions } from "../routers/authenticator";

let testOne = 461;
console.log(Permissions);
console.log(decodePermissions(testOne));
console.log(testOne);

let testTwo = 257;
console.log(decodePermissions(testTwo));
console.log(testTwo);

let testThree = 256+128;
console.log(decodePermissions(testThree));
console.log(testThree);