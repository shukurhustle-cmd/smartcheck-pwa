import assert from "node:assert/strict";

const ROLES=["ADMIN","PARENT","VISITOR","APPROVER","RECEPTION","SECURITY"];
const routes=[
  ["/dashboard",ROLES],
  ["/admin",["ADMIN"]],
  ["/approvals",["ADMIN","APPROVER"]],
  ["/parent",["ADMIN","PARENT"]],
  ["/visitor",["ADMIN","VISITOR"]],
  ["/reception",["ADMIN","RECEPTION"]],
  ["/security",["ADMIN","SECURITY"]],
  ["/reports",["ADMIN"]],
  ["/notifications",ROLES],
  ["/patrols",["ADMIN","SECURITY"]],
  ["/help",["ADMIN","SECURITY"]],
];
const allowed=(path)=>routes.find(([prefix])=>path===prefix||path.startsWith(prefix+"/"))?.[1]??null;

assert.deepEqual(allowed("/dashboard"),ROLES);
assert.deepEqual(allowed("/admin/students"),["ADMIN"]);
assert.deepEqual(allowed("/approvals"),["ADMIN","APPROVER"]);
assert.deepEqual(allowed("/reception"),["ADMIN","RECEPTION"]);
assert.deepEqual(allowed("/security/scan"),["ADMIN","SECURITY"]);
assert.deepEqual(allowed("/security/vehicles"),["ADMIN","SECURITY"]);
assert.deepEqual(allowed("/patrols"),["ADMIN","SECURITY"]);
assert.equal(allowed("/unknown"),null);

console.log("route policy contract tests passed");
