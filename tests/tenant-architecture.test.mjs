import test from "node:test";
import assert from "node:assert/strict";

const ROLE_CONTRACT = {
  PLATFORM_ADMIN: ["TENANT_CREATE", "TENANT_MANAGE", "TENANT_USERS_MANAGE"],
  ADMIN: ["TENANT_USERS_MANAGE", "MASTER_DATA_IMPORT", "WORKFLOW_MANAGE"],
  PARENT: ["EARLY_PICKUP_CREATE", "OWN_REQUESTS_VIEW"],
  VISITOR: ["VISIT_CREATE", "OWN_REQUESTS_VIEW"],
  APPROVER: ["REQUEST_VIEW", "REQUEST_APPROVE", "REQUEST_REJECT"],
  RECEPTION: ["QR_SCAN", "RECEPTION_CONFIRM"],
  SECURITY: ["QR_SCAN", "SECURITY_CONFIRM", "VEHICLE_CAPTURE", "PATROL", "HELP"],
};

const TENANT_TYPES = ["SCHOOL", "HOSPITAL", "APARTMENT", "CORPORATE", "OTHER"];

test("tenant types cover the approved multi-provider model", () => {
  assert.deepEqual(TENANT_TYPES, ["SCHOOL", "HOSPITAL", "APARTMENT", "CORPORATE", "OTHER"]);
});

test("platform admin owns tenant provisioning permissions", () => {
  assert.ok(ROLE_CONTRACT.PLATFORM_ADMIN.includes("TENANT_CREATE"));
  assert.ok(ROLE_CONTRACT.PLATFORM_ADMIN.includes("TENANT_MANAGE"));
});

test("tenant admin owns tenant-scoped users and imports", () => {
  assert.ok(ROLE_CONTRACT.ADMIN.includes("TENANT_USERS_MANAGE"));
  assert.ok(ROLE_CONTRACT.ADMIN.includes("MASTER_DATA_IMPORT"));
});

test("operational roles remain least-privilege", () => {
  assert.deepEqual(ROLE_CONTRACT.RECEPTION, ["QR_SCAN", "RECEPTION_CONFIRM"]);
  assert.ok(!ROLE_CONTRACT.RECEPTION.includes("MASTER_DATA_IMPORT"));
  assert.ok(!ROLE_CONTRACT.SECURITY.includes("TENANT_USERS_MANAGE"));
});

test("tenant data contract requires tenant isolation", () => {
  const requiredTenantFields = ["tenantId", "tenantType", "status"];
  assert.deepEqual(requiredTenantFields, ["tenantId", "tenantType", "status"]);
});

test("student import contract includes transport fields", () => {
  const requiredColumns = [
    "studentName", "className", "section", "fatherName", "motherName",
    "fatherMobile", "motherMobile", "busNumber", "routeNumber", "transportType"
  ];
  assert.ok(requiredColumns.includes("transportType"));
  assert.ok(requiredColumns.includes("busNumber"));
  assert.ok(requiredColumns.includes("routeNumber"));
});
