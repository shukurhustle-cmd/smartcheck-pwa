import {NextRequest,NextResponse} from "next/server";
import {ROLES} from "@/lib/auth/rbac";
import {isValidRole} from "@/lib/auth/route-policy";

export async function GET(req:NextRequest){
  const role=req.cookies.get("smartcheck_role")?.value;
  if(!isValidRole(role))return NextResponse.json({authenticated:false},{status:401});
  return NextResponse.json({authenticated:true,role});
}

export async function POST(req:NextRequest){
  const {role}=await req.json();
  if(!ROLES.includes(role))return NextResponse.json({error:"Invalid role"},{status:400});

  const response=NextResponse.json({success:true,role,mode:"PILOT_ROLE_SESSION"});
  response.cookies.set("smartcheck_role",role,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/",
    maxAge:8*60*60,
  });
  return response;
}
