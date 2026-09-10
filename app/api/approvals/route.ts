import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {getPool,withTransaction} from "@/lib/db";
import {createHash} from "node:crypto";
import {createQRToken} from "@/lib/qr/service";
import QRCode from "qrcode";

async function notify(client:any,tenantId:string,ticketDbId:string,roles:string[],title:string,message:string){
  const users=(await client.query(`SELECT id FROM users WHERE tenant_id=$1 AND active=true AND role=ANY($2::text[])`,[tenantId,roles])).rows;
  for(const user of users)await client.query(`INSERT INTO notifications(tenant_id,user_id,ticket_id,type,title,message) VALUES($1,$2,$3,'WORKFLOW_UPDATE',$4,$5)`,[tenantId,user.id,ticketDbId,title,message]);
}

export async function GET(req:NextRequest){
  const session=requireRole(req,["APPROVER","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Approver access required"},{status:403});
  try{
    const rows=(await getPool().query(`SELECT t.id,t.ticket_id,t.subject_name,t.reason,t.status,t.current_step,t.current_assignee,t.created_at,u.name AS parent_name,u.mobile AS parent_mobile FROM tickets t LEFT JOIN users u ON u.id=t.created_by WHERE t.tenant_id=$1 AND t.status='PENDING_APPROVAL' ORDER BY t.created_at ASC`,[session.tenantId])).rows;
    return NextResponse.json({requests:rows});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load approvals"},{status:503});}
}

export async function POST(req:NextRequest){
  const session=requireRole(req,["APPROVER","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Approver access required"},{status:403});
  const tenantId:string=session.tenantId;
  try{
    const body=await req.json();
    const ticketId=String(body.ticketId||"");
    const action=String(body.action||"").toUpperCase();
    const remarks=String(body.remarks||"").trim();
    if(!ticketId||!["APPROVE","REJECT"].includes(action))return NextResponse.json({error:"ticketId and APPROVE or REJECT are required"},{status:400});
    const result=await withTransaction(async client=>{
      const ticket=(await client.query(`SELECT id,ticket_id,subject_name,reason,status,created_by FROM tickets WHERE ticket_id=$1 AND tenant_id=$2 FOR UPDATE`,[ticketId,tenantId])).rows[0];
      if(!ticket)return {error:"Request not found"};
      if(ticket.status!=="PENDING_APPROVAL")return {error:"Request is no longer pending"};
      if(typeof ticket.id!=="string"||ticket.id.length===0||typeof ticket.ticket_id!=="string"||ticket.ticket_id.length===0||typeof ticket.subject_name!=="string"||typeof ticket.reason!=="string")return {error:"Request record is incomplete"};
      const ticketDbId:string=ticket.id;
      const ticketPublicId:string=ticket.ticket_id;
      const subjectName:string=ticket.subject_name;
      const reason:string=ticket.reason;
      if(action==="REJECT"){
        await client.query(`UPDATE tickets SET status='REJECTED',current_step='CLOSED',current_assignee='CLOSED',rejection_reason=$1,updated_at=now() WHERE id=$2`,[remarks,ticketDbId]);
        await notify(client,tenantId,ticketDbId,["PARENT","ADMIN","APPROVER","RECEPTION","SECURITY"],"Early pickup request rejected",`${subjectName} — ${reason}${remarks?` — ${remarks}`:""}`);
        return {status:"REJECTED"};
      }
      const token=createQRToken(ticketPublicId);
      const qrDataUrl=await QRCode.toDataURL(token,{margin:2,width:600});
      const expiresAt=new Date(Date.now()+30*60*1000);
      const tokenHash=createHash("sha256").update(token).digest("hex");
      await client.query(`UPDATE tickets SET status='QR_READY',current_step='RECEPTION',current_assignee='RECEPTION',qr_token_hash=$1,qr_expires_at=$2,updated_at=now() WHERE id=$3`,[tokenHash,expiresAt,ticketDbId]);
      await notify(client,tenantId,ticketDbId,["PARENT","ADMIN","RECEPTION"],"Early pickup approved",`${subjectName} — QR ready for reception verification.`);
      return {status:"QR_READY",ticketId:ticketPublicId,token,qrDataUrl,expiresAt:expiresAt.toISOString()};
    });
    if("error" in result)return NextResponse.json({error:result.error},{status:409});
    return NextResponse.json({success:true,...result});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Approval action failed"},{status:500});}
}
