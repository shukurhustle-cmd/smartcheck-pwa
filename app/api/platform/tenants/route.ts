import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {hashPassword} from "@/lib/auth/credentials";
import {withTransaction} from "@/lib/db";

const TYPES=["SCHOOL","HOSPITAL","APARTMENT","CORPORATE","OTHER"] as const;

export async function POST(req:NextRequest){
  const session=requireRole(req,["PLATFORM_ADMIN"]);
  if(!session)return NextResponse.json({error:"Platform admin access required"},{status:403});
  try{
    const body=await req.json();
    const name=String(body.name||"").trim();
    const code=String(body.code||name).trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"");
    const type=String(body.type||"").toUpperCase();
    const adminUsername=String(body.adminUsername||"").trim();
    const adminPassword=String(body.adminPassword||"");
    const adminName=String(body.adminName||"").trim();
    const adminMobile=String(body.adminMobile||"").trim();
    if(!name||!code||!TYPES.includes(type as typeof TYPES[number]))return NextResponse.json({error:"Tenant name, code and valid type are required"},{status:400});
    if(!adminUsername||adminPassword.length<8||!adminName)return NextResponse.json({error:"Tenant admin name, username and password (minimum 8 characters) are required"},{status:400});
    const modules=Array.isArray(body.modules)?body.modules.map(String):[];
    const result=await withTransaction(async client=>{
      const tenant=(await client.query(`INSERT INTO tenants(code,name,type,address,contact_name,contact_mobile,contact_email,logo_url,modules) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,code,name,type,status`,[code,name,type,String(body.address||""),String(body.contactName||""),String(body.contactMobile||""),String(body.contactEmail||""),String(body.logoUrl||""),JSON.stringify(modules)])).rows[0];
      const user=(await client.query(`INSERT INTO users(tenant_id,username,mobile,password_hash,name,role,department) VALUES($1,$2,$3,$4,$5,'ADMIN',$6) RETURNING id,username,mobile,name,role`,[tenant.id,adminUsername,adminMobile,hashPassword(adminPassword),adminName,"Administration"])).rows[0];
      await client.query(`INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,details) VALUES($1,'TENANT_CREATED','TENANT',$2,$3)`,[session.userId,tenant.id,JSON.stringify({type,name,adminUserId:user.id})]);
      return {tenant,user};
    });
    return NextResponse.json({success:true,...result});
  }catch(error){
    const message=error instanceof Error?error.message:"Tenant creation failed";
    const duplicate=message.includes("duplicate key");
    return NextResponse.json({error:duplicate?"Tenant code or username already exists":message},{status:duplicate?409:500});
  }
}

export async function GET(req:NextRequest){
  const session=requireRole(req,["PLATFORM_ADMIN"]);
  if(!session)return NextResponse.json({error:"Platform admin access required"},{status:403});
  try{const rows=(await (await import("@/lib/db")).getPool().query(`SELECT id,code,name,type,status,contact_name,contact_mobile,contact_email,modules,created_at FROM tenants ORDER BY created_at DESC`)).rows;return NextResponse.json({tenants:rows});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load tenants"},{status:503});}
}
