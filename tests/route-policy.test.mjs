import assert from "node:assert/strict";
import {allowedRolesForPath,isPublicPath,ROLES} from "../lib/auth/route-policy.mjs";

assert.deepEqual(ROLES,["ADMIN","PARENT","VISITOR","APPROVER","RECEPTION","SECURITY"]);
assert.equal(isPublicPath("/"),true);
assert.equal(isPublicPath("/login"),true);
assert.deepEqual(allowedRolesForPath("/dashboard"),ROLES);
assert.deepEqual(allowedRolesForPath("/admin/students"),["ADMIN"]);
assert.deepEqual(allowedRolesForPath("/approvals"),["ADMIN","APPROVER"]);
assert.deepEqual(allowedRolesForPath("/reception"),["ADMIN","RECEPTION"]);
assert.deepEqual(allowedRolesForPath("/security/scan"),["ADMIN","SECURITY"]);
assert.deepEqual(allowedRolesForPath("/security/vehicles"),["ADMIN","SECURITY"]);
assert.deepEqual(allowedRolesForPath("/patrols"),["ADMIN","SECURITY"]);
assert.equal(allowedRolesForPath("/api/auth/session"),null);
assert.equal(allowedRolesForPath("/unknown"),null);

console.log("route policy tests passed");
