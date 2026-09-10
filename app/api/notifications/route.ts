import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {listNotifications} from "@/lib/notifications/service";

export async function GET(req:NextRequest){
  const session=requireRole(req,["PLATFORM_ADMIN","ADMIN","PARENT","VISITOR","APPROVER","RECEPTION","SECURITY"]);
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  try{return NextResponse.json({success:true,notifications:await listNotifications(session.userId)});}catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:"Notifications failed"},{status:503});}
}
