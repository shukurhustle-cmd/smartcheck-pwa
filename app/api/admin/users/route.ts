import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {hashPassword} from "@/lib/auth/credentials";
import {getPool} from "@/lib/db";

const ALLOWED_ROLES=["PARENT","VISITOR","APPROVER","RECEPTION","SECURITY"] as const;

export async function GET(req:NextRequest){
  const session=requireRole(req,["ADMIN","PLATFORM_ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Tenant admin access required"},{status:403});
  try{const rows=(await getPool().query(`SELECT id,username,mobile,name,role,department,active,created_at FROM users WHERE tenant_id=$1 ORDER BY created_at DESC`,[session.tenantId])).rows;return NextResponse.json({users:rows});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load users"},{status:503});}
}

export async function POST(req:NextRequest){
  const session=requireRole(req,["ADMIN","PLATFORM_ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Tenant admin access required"},{status:403});
  try{
    const body=await req.json();
    const role=String(body.role||"").toUpperCase();
    const username=String(body.username||"").trim();
    const password=String(body.password||"");
    const name=String(body.name||"").trim();
    if(!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]))return NextResponse.json({error:"Invalid tenant user role"},{status:400});
    if(!username||!name||password.length<8)return NextResponse.json({error:"Name, username and password (minimum 8 characters) are required"},{status:400});
    const user=(await getPool().query(`INSERT INTO users(tenant_id,username,mobile,password_hash,name,role,department) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,username,mobile,name,role,department,active`,[session.tenantId,username,String(body.mobile||""),hashPassword(password),name,role,String(body.department||"")])).rows[0];
    return NextResponse.json({success:true,user});
  }catch(error){const message=error instanceof Error?error.message:"Unable to create user";return NextResponse.json({error:message.includes("duplicate key")?"Username already exists":message},{status:message.includes("duplicate key")?409:500});}
}
