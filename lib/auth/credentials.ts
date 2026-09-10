import {randomBytes,scryptSync,timingSafeEqual} from "node:crypto";
import {getPool} from "@/lib/db";
import type {Role} from "@/lib/auth/rbac";

export type AuthenticatedUser={id:string;tenantId:string|null;username:string;mobile:string;name:string;role:Role;department:string};

export function hashPassword(password:string){
  const salt=randomBytes(16).toString("hex");
  const hash=scryptSync(password,salt,64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password:string,stored:string){
  const [scheme,salt,hex]=stored.split(":");
  if(scheme!=="scrypt"||!salt||!hex)return false;
  try{return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hex,"hex"));}catch{return false;}
}

export async function authenticate(usernameOrMobile:string,password:string):Promise<AuthenticatedUser|null>{
  const bootstrapUser=process.env.SMARTCHECK_PLATFORM_ADMIN_USERNAME;
  const bootstrapPassword=process.env.SMARTCHECK_PLATFORM_ADMIN_PASSWORD;
  if(bootstrapUser&&bootstrapPassword&&usernameOrMobile===bootstrapUser&&password===bootstrapPassword){
    return {id:"platform-bootstrap",tenantId:null,username:bootstrapUser,mobile:"",name:"SmartCheck Platform Admin",role:"PLATFORM_ADMIN",department:"Platform"};
  }
  const result=await getPool().query(
    `SELECT id,tenant_id,username,mobile,name,role,department,password_hash FROM users WHERE active=true AND (username=$1 OR mobile=$1) LIMIT 1`,
    [usernameOrMobile]
  );
  const row=result.rows[0];
  if(!row||!verifyPassword(password,row.password_hash))return null;
  return {id:row.id,tenantId:row.tenant_id,username:row.username,mobile:row.mobile,name:row.name,role:row.role,department:row.department};
}
