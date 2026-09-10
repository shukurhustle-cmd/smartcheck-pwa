import {NextRequest,NextResponse} from "next/server";
import QRCode from "qrcode";
import {createQRToken} from "@/lib/qr/service";
import {requireRole} from "@/lib/auth/require-session";
import {getPool} from "@/lib/db";
import {createHash} from "node:crypto";

export async function POST(req:NextRequest){
  const session=requireRole(req,["APPROVER","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Approver access required"},{status:403});
  try{
    const {ticketId}=await req.json();
    if(!ticketId)return NextResponse.json({error:"ticketId required"},{status:400});
    const ticket=(await getPool().query(`SELECT id,ticket_id,status FROM tickets WHERE ticket_id=$1 AND tenant_id=$2`,[ticketId,session.tenantId])).rows[0];
    if(!ticket)return NextResponse.json({error:"Ticket not found"},{status:404});
    if(ticket.status!=="QR_READY")return NextResponse.json({error:"QR can only be generated after approval"},{status:409});
    const token=createQRToken(ticket.ticket_id);const qrDataUrl=await QRCode.toDataURL(token,{margin:2,width:600});const expiresAt=new Date(Date.now()+30*60*1000);const hash=createHash("sha256").update(token).digest("hex");
    await getPool().query(`UPDATE tickets SET qr_token_hash=$1,qr_expires_at=$2,updated_at=now() WHERE id=$3`,[hash,expiresAt,ticket.id]);
    return NextResponse.json({ticketId,token,qrDataUrl,expiresAt:expiresAt.toISOString()});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"QR generation failed"},{status:500});}
}
