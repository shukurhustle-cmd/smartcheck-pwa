import {createHmac,timingSafeEqual} from "node:crypto";
import type {Role} from "@/lib/auth/rbac";

export type Session={userId:string;tenantId:string|null;role:Role;name:string;exp:number};
const COOKIE_NAME="smartcheck_session";
const ttl=8*60*60;

function secret(){
  const value=process.env.SMARTCHECK_SESSION_SECRET;
  if(!value)throw new Error("SMARTCHECK_SESSION_SECRET is not configured");
  return value;
}
function encode(value:string){return Buffer.from(value,"utf8").toString("base64url");}
function sign(value:string){return createHmac("sha256",secret()).update(value).digest("base64url");}

export function createSessionToken(session:Omit<Session,"exp">){
  const payload=encode(JSON.stringify({...session,exp:Math.floor(Date.now()/1000)+ttl}));
  return payload+"."+sign(payload);
}

export function verifySessionToken(token:string|undefined):Session|null{
  if(!token)return null;
  const [payload,signature]=token.split(".");
  if(!payload||!signature)return null;
  const expected=sign(payload);
  try{
    if(!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;
    const session=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as Session;
    if(!session.exp||session.exp<Math.floor(Date.now()/1000))return null;
    return session;
  }catch{return null;}
}

export const SESSION_COOKIE=COOKIE_NAME;
export const SESSION_TTL=ttl;
