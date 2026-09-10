import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth/require-session";
import {getPool,withTransaction} from "@/lib/db";
import * as XLSX from "xlsx";

const aliases:Record<string,string>={
  studentname:"studentName",student:"studentName",classname:"className",class:"className",section:"section",
  fathername:"fatherName",mothername:"motherName",fathermobile:"fatherMobile",mothermobile:"motherMobile",
  busnumber:"busNumber",busno:"busNumber",routenumber:"routeNumber",routeno:"routeNumber",transporttype:"transportType",transport:"transportType"
};
function key(value:string){return value.toLowerCase().replace(/[^a-z0-9]/g,"");}
function normalize(row:Record<string,unknown>){const out:Record<string,string>={};for(const [k,v] of Object.entries(row)){const mapped=aliases[key(k)];if(mapped)out[mapped]=String(v??"").trim();}return out;}
function transport(value:string){const v=value.toUpperCase().replace(/[ -]/g,"_");if(v.includes("BUS"))return "SCHOOL_BUS";if(v.includes("OWN")||v.includes("SELF"))return "OWN";return "OTHER";}

export async function POST(req:NextRequest){
  const session=requireRole(req,["ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Tenant admin access required"},{status:403});
  try{
    const form=await req.formData();
    const file=form.get("file");
    if(!(file instanceof File))return NextResponse.json({error:"CSV or Excel file is required"},{status:400});
    if(file.size>5*1024*1024)return NextResponse.json({error:"File must be 5 MB or smaller"},{status:400});
    const bytes=await file.arrayBuffer();
    const workbook=XLSX.read(Buffer.from(bytes),{type:"buffer"});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    if(!sheet)return NextResponse.json({error:"No worksheet found"},{status:400});
    const rows=(XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:""})).map(normalize);
    const valid=rows.filter(r=>r.studentName);
    const invalid=rows.length-valid.length;
    if(!valid.length)return NextResponse.json({error:"No valid student rows found. Student Name is required."},{status:400});
    await withTransaction(async client=>{
      for(const row of valid){
        await client.query(`INSERT INTO students(tenant_id,student_name,class_name,section,father_name,mother_name,father_mobile,mother_mobile,bus_number,route_number,transport_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[session.tenantId,row.studentName,row.className||"",row.section||"",row.fatherName||"",row.motherName||"",row.fatherMobile||"",row.motherMobile||"",row.busNumber||"",row.routeNumber||"",transport(row.transportType||"")]);
      }
      await client.query(`INSERT INTO audit_logs(tenant_id,actor_user_id,action,entity_type,entity_id,details) VALUES($1,$2,'STUDENTS_IMPORTED','STUDENT_IMPORT',$1,$3)`,[session.tenantId,session.userId,JSON.stringify({filename:file.name,total:rows.length,imported:valid.length,invalid})]);
    });
    return NextResponse.json({success:true,total:rows.length,imported:valid.length,invalid});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Import failed"},{status:500});}
}

export async function GET(req:NextRequest){
  const session=requireRole(req,["ADMIN"]);
  if(!session?.tenantId)return NextResponse.json({error:"Tenant admin access required"},{status:403});
  try{const rows=(await getPool().query(`SELECT id,student_name,class_name,section,father_name,mother_name,father_mobile,mother_mobile,bus_number,route_number,transport_type FROM students WHERE tenant_id=$1 ORDER BY class_name,section,student_name`,[session.tenantId])).rows;return NextResponse.json({students:rows});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load students"},{status:503});}
}
