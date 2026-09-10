import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {getPool} from "@/lib/db";
import {randomUUID} from "node:crypto";

export async function POST(req:NextRequest){
  const session=requireRole(req,["PARENT","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Parent access required"},{status:403});
  try{
    const body=await req.json();
    const studentId=String(body.studentId||"");
    const reason=String(body.reason||"").trim();
    if(!studentId||!reason)return NextResponse.json({error:"Student and reason are required"},{status:400});
    const pool=getPool();
    const studentQuery=session.role==="PARENT"
      ? `SELECT s.id,s.student_name,s.class_name,s.section FROM students s JOIN parent_student ps ON ps.student_id=s.id WHERE s.id=$1 AND s.tenant_id=$2 AND ps.parent_user_id=$3`
      : `SELECT id,student_name,class_name,section FROM students WHERE id=$1 AND tenant_id=$2`;
    const params=session.role==="PARENT"?[studentId,session.tenantId,session.userId]:[studentId,session.tenantId];
    const student=(await pool.query(studentQuery,params)).rows[0];
    if(!student)return NextResponse.json({error:"Student is not linked to this account"},{status:403});
    const ticketId="SC-"+randomUUID().slice(0,8).toUpperCase();
    const ticket=(await pool.query(`INSERT INTO tickets(tenant_id,ticket_id,ticket_type,student_id,subject_name,reason,status,current_step,current_assignee,created_by) VALUES($1,$2,'EARLY_PICKUP',$3,$4,$5,'PENDING_APPROVAL','APPROVAL','APPROVER',$6) RETURNING ticket_id,subject_name,reason,status,current_step,current_assignee,created_at`,[session.tenantId,ticketId,student.id,student.student_name,reason,session.userId])).rows[0];
    const approvers=(await pool.query(`SELECT id FROM users WHERE tenant_id=$1 AND role='APPROVER' AND active=true`,[session.tenantId])).rows;
    for(const approver of approvers){await pool.query(`INSERT INTO notifications(tenant_id,user_id,ticket_id,type,title,message) VALUES($1,$2,(SELECT id FROM tickets WHERE ticket_id=$3),'APPROVAL_REQUIRED','Early pickup approval required',$4)`,[session.tenantId,approver.id,ticketId,`${student.student_name} (${student.class_name} ${student.section}) — ${reason}`]);}
    return NextResponse.json({success:true,ticket});
  }catch(error){return NextResponse.json({success:false,error:error instanceof Error?error.message:"Request failed"},{status:500});}
}

export async function GET(req:NextRequest){
  const session=requireRole(req,["PARENT","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Parent access required"},{status:403});
  try{
    const rows=session.role==="PARENT"
      ? (await getPool().query(`SELECT t.ticket_id,t.subject_name,t.reason,t.status,t.current_step,t.current_assignee,t.created_at FROM tickets t WHERE t.tenant_id=$1 AND t.created_by=$2 ORDER BY t.created_at DESC`,[session.tenantId,session.userId])).rows
      : (await getPool().query(`SELECT t.ticket_id,t.subject_name,t.reason,t.status,t.current_step,t.current_assignee,t.created_at FROM tickets t WHERE t.tenant_id=$1 ORDER BY t.created_at DESC`,[session.tenantId])).rows;
    return NextResponse.json({tickets:rows});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load requests"},{status:503});}
}
