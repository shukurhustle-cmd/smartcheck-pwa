import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const routePath=path.join(process.cwd(),"app","api","approvals","route.ts");
const source=fs.readFileSync(routePath,"utf8");

test("approval handler captures tenantId as a non-null string before transaction closure",()=>{
  assert.match(source,/const tenantId:string=session\.tenantId;/);
  assert.doesNotMatch(source,/withTransaction\(async client=>[\s\S]*session\.tenantId/);
});
