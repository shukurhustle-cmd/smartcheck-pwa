import {NextRequest,NextResponse} from "next/server";
import {createNotification,listNotifications} from "@/lib/notifications/service";

export async function GET(req:NextRequest){
  try{const {searchParams}=new URL(req.url);return NextResponse.json({success:true,notifications:await listNotifications(searchParams.get("recipient")||undefined,searchParams.get("role")||undefined)});}catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:"Notifications failed"},{status:500});}
}

export async function POST(req:NextRequest){
  try{const body=await req.json();if(!body.recipient&&!body.role||!body.title||!body.message)return NextResponse.json({success:false,error:"recipient or role, title and message are required"},{status:400});return NextResponse.json({success:true,notification:await createNotification({recipient:body.recipient||"",role:body.role||"",title:body.title,message:body.message,ticketId:body.ticketId})});}catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:"Notification failed"},{status:500});}
}