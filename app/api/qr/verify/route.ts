import {NextRequest,NextResponse} from "next/server";
import {verifyQRToken} from "@/lib/qr/service";
import {requireRole} from "@/lib/auth/require-session";
import {getPool} from "@/lib/db";
import {createHash} from "node:crypto";

export async function POST(req:NextRequest){
  const session=requireRole(req,["RECEPTION","SECURITY","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({valid:false,error:"Authorised reception or security access required"},{status:403});
  try{
    const {token,checkpoint}=await req.json();
    const payload=verifyQRToken(String(token||""));
    if(!payload)return NextResponse.json({valid:false,error:"Invalid QR token"},{status:400});
    if(checkpoint!=="RECEPTION"&&checkpoint!=="SECURITY")return NextResponse.json({valid:false,error:"Invalid checkpoint"},{status:400});
    if(checkpoint==="RECEPTION"&&!(["RECEPTION","ADMIN"].includes(session.role)))return NextResponse.json({valid:false,error:"Reception permission required"},{status:403});
    if(checkpoint==="SECURITY"&&!(["SECURITY","ADMIN"].includes(session.role)))return NextResponse.json({valid:false,error:"Security permission required"},{status:403});
    const pool=getPool();
    const ticket=(await pool.query(`SELECT id,ticket_id,subject_name,status,qr_token_hash,qr_expires_at FROM tickets WHERE ticket_id=$1 AND tenant_id=$2`,[payload.ticketId,session.tenantId])).rows[0];
    if(!ticket)return NextResponse.json({valid:false,error:"QR does not belong to this tenant"},{status:403});
    const expectedStatus=checkpoint==="RECEPTION"?"QR_READY":"SECURITY_PENDING";
    if(ticket.status!==expectedStatus)return NextResponse.json({valid:false,error:`QR is not valid for ${checkpoint.toLowerCase()} checkpoint`},{status:409});
    const hash=createHash("sha256").update(String(token)).digest("hex");
    if(ticket.qr_token_hash!==hash)return NextResponse.json({valid:false,error:"QR token has been revoked"},{status:400});
    if(!ticket.qr_expires_at||new Date(ticket.qr_expires_at).getTime()<Date.now())return NextResponse.json({valid:false,error:"QR token has expired"},{status:400});
    const next=checkpoint==="RECEPTION"?"SECURITY_PENDING":"CLOSED";
    const assignee=checkpoint==="RECEPTION"?"SECURITY":"CLOSED";
    await pool.query(`UPDATE tickets SET status=$1,current_step=$2,current_assignee=$3,qr_token_hash=CASE WHEN $4='CLOSED' THEN '' ELSE qr_token_hash END,updated_at=now() WHERE id=$5`,[next,checkpoint,assignee,next,ticket.id]);
    if(next==="SECURITY_PENDING"){
      const users=(await pool.query(`SELECT id FROM users WHERE tenant_id=$1 AND active=true AND role='SECURITY'`,[session.tenantId])).rows;
      for(const user of users)await pool.query(`INSERT INTO notifications(tenant_id,user_id,ticket_id,type,title,message) VALUES($1,$2,$3,'WORKFLOW_UPDATE','Security verification required',$4)`,[session.tenantId,user.id,ticket.id,`${ticket.subject_name} — approved QR confirmed at reception.`]);
    }
    return NextResponse.json({valid:true,ticketId:ticket.ticket_id,checkpoint,status:next,scannedAt:new Date().toISOString()});
  }catch(error){return NextResponse.json({valid:false,error:error instanceof Error?error.message:"QR verification failed"},{status:500});}
}
