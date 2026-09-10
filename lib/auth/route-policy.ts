import {ROLES,type Role} from "@/lib/auth/rbac";

export const PUBLIC_PATHS=["/","/login"] as const;

const PROTECTED_ROUTES:Array<[string,Role[]]>=[
  ["/dashboard",[...ROLES]],
  ["/admin",["ADMIN"]],
  ["/approvals",["ADMIN","APPROVER"]],
  ["/parent",["ADMIN","PARENT"]],
  ["/visitor",["ADMIN","VISITOR"]],
  ["/reception",["ADMIN","RECEPTION"]],
  ["/security",["ADMIN","SECURITY"]],
  ["/reports",["ADMIN"]],
  ["/notifications",[...ROLES]],
  ["/patrols",["ADMIN","SECURITY"]],
  ["/help",["ADMIN","SECURITY"]],
];

export function isPublicPath(pathname:string){return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]);}

export function allowedRolesForPath(pathname:string):Role[]|null{
  const match=PROTECTED_ROUTES.find(([prefix])=>pathname===prefix||pathname.startsWith(prefix+"/"));
  return match?match[1]:null;
}

export function isValidRole(value:string|undefined):value is Role{return !!value&&ROLES.includes(value as Role);}
