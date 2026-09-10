import {NextResponse} from "next/server";
import {SESSION_COOKIE} from "@/lib/auth/session";

export async function POST(){
  const response=NextResponse.json({success:true});
  for(const name of [SESSION_COOKIE,"smartcheck_role"]){
    response.cookies.set(name,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
  }
  return response;
}
