import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {getPool} from "@/lib/db";

export async function GET(req:NextRequest){
  const session=requireRole(req,["PARENT","ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Parent access required"},{status:403});
  try{
    const rows=session.role==="PARENT"
      ? (await getPool().query(`SELECT s.id,s.student_name,s.class_name,s.section FROM students s JOIN parent_student ps ON ps.student_id=s.id WHERE s.tenant_id=$1 AND ps.parent_user_id=$2 ORDER BY s.student_name`,[session.tenantId,session.userId])).rows
      : (await getPool().query(`SELECT id,student_name,class_name,section FROM students WHERE tenant_id=$1 ORDER BY student_name`,[session.tenantId])).rows;
    return NextResponse.json({students:rows});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load students"},{status:503});}
}
