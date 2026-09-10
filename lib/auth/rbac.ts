export const ROLES=["PLATFORM_ADMIN","ADMIN","PARENT","VISITOR","APPROVER","RECEPTION","SECURITY"] as const;
export type Role=typeof ROLES[number];

export const permissions:Record<Role,string[]>={
  PLATFORM_ADMIN:["TENANT_CREATE","TENANT_MANAGE","TENANT_USERS_MANAGE","VIEW_PLATFORM_AUDIT"],
  ADMIN:["TENANT_USERS_MANAGE","MASTER_DATA_IMPORT","WORKFLOW_MANAGE","VIEW_TENANT_REPORTS"],
  PARENT:["CREATE_EARLY_PICKUP","VIEW_OWN"],
  VISITOR:["CREATE_VISIT","VIEW_OWN"],
  APPROVER:["VIEW_ASSIGNED","APPROVE","REJECT"],
  RECEPTION:["VERIFY_RECEPTION"],
  SECURITY:["VERIFY_SECURITY","VEHICLE_CAPTURE","PATROL","HELP"]
};

export function can(role:Role,permission:string){
  return permissions[role]?.includes("*")||permissions[role]?.includes(permission);
}
