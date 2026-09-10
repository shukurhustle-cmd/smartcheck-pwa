import {NextRequest,NextResponse} from "next/server";
import {authenticate} from "@/lib/auth/credentials";
import {createSessionToken,SESSION_COOKIE,SESSION_TTL,verifySessionToken} from "@/lib/auth/session";

export async function GET(req:NextRequest){
  const session=verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if(!session)return NextResponse.json({authenticated:false},{status:401});
  return NextResponse.json({authenticated:true,user:session});
}

export async function POST(req:NextRequest){
  try{
    const body=await req.json();
    const usernameOrMobile=String(body.usernameOrMobile||body.username||body.mobile||"").trim();
    const password=String(body.password||"");
    if(!usernameOrMobile||!password)return NextResponse.json({error:"Username/mobile and password are required"},{status:400});
    const user=await authenticate(usernameOrMobile,password);
    if(!user)return NextResponse.json({error:"Invalid credentials"},{status:401});
    const token=createSessionToken({userId:user.id,tenantId:user.tenantId,role:user.role,name:user.name});
    const response=NextResponse.json({success:true,user:{id:user.id,tenantId:user.tenantId,username:user.username,mobile:user.mobile,name:user.name,role:user.role,department:user.department}});
    response.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_TTL});
    response.cookies.set("smartcheck_role","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
    return response;
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Authentication service unavailable"},{status:503});
  }
}
