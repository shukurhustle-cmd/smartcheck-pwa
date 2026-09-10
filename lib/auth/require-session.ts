import {NextRequest} from "next/server";
import {verifySessionToken,SESSION_COOKIE,type Session} from "@/lib/auth/session";
import type {Role} from "@/lib/auth/rbac";

export function getSession(req:NextRequest):Session|null{return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);}

export function requireRole(req:NextRequest,roles:Role[]){
  const session=getSession(req);
  if(!session||!roles.includes(session.role))return null;
  return session;
}
