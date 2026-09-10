import {ROLES,type Role} from "@/lib/auth/rbac";

export const PUBLIC_PATHS=["/","/login"] as const;

const PROTECTED_ROUTES:Array<[string,Role[]]>=[
  ["/platform-admin",["PLATFORM_ADMIN"]],
  ["/dashboard",[...ROLES]],
  ["/admin",["PLATFORM_ADMIN","ADMIN"]],
  ["/approvals",["PLATFORM_ADMIN","ADMIN","APPROVER"]],
  ["/parent",["PLATFORM_ADMIN","ADMIN","PARENT"]],
  ["/visitor",["PLATFORM_ADMIN","ADMIN","VISITOR"]],
  ["/reception",["PLATFORM_ADMIN","ADMIN","RECEPTION"]],
  ["/security",["PLATFORM_ADMIN","ADMIN","SECURITY"]],
  ["/reports",["PLATFORM_ADMIN","ADMIN"]],
  ["/notifications",[...ROLES]],
  ["/patrols",["PLATFORM_ADMIN","ADMIN","SECURITY"]],
  ["/help",["PLATFORM_ADMIN","ADMIN","SECURITY"]],
];

export function isPublicPath(pathname:string){return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]);}

export function allowedRolesForPath(pathname:string):Role[]|null{
  const match=PROTECTED_ROUTES.find(([prefix])=>pathname===prefix||pathname.startsWith(prefix+"/"));
  return match?match[1]:null;
}

export function isValidRole(value:string|undefined):value is Role{return !!value&&ROLES.includes(value as Role);}
