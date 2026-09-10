"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

const tasks=[{title:"Early Pickup Request",person:"Ahmed Khan · Class 8A",status:"Pending Approval",color:"#dc2626"},{title:"Visitor Request",person:"John · Meeting Dr. Kumar",status:"Reception Queue",color:"#f59e0b"}];
const actions={
  ADMIN:[["Administration","Manage master data and workflows","/admin"],["Daily Reports","Review operational reports","/reports"]],
  PARENT:[["Early Pickup","Create an early pickup request","/parent"]],
  VISITOR:[["Visitor Entry","Create a visitor request","/visitor"]],
  APPROVER:[["Approvals","Review and approve pending requests","/approvals"]],
  RECEPTION:[["Reception Queue","Verify approved arrivals","/reception"]],
  SECURITY:[["QR Scanner","Verify reception and security checkpoints","/security/scan"],["Vehicles","Capture and review vehicle entries","/security/vehicles"],["Patrols","Manage patrol checkpoints","/patrols"]],
} as const;

type Role=keyof typeof actions;

export default function Dashboard(){
  const [role,setRole]=useState<Role|null>(null);
  useEffect(()=>{fetch("/api/auth/session").then(r=>r.ok?r.json():null).then(d=>d?.role&&setRole(d.role)).catch(()=>{});},[]);
  const links=role?actions[role]:[];
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});window.location.href="/login";}

  return <main style={{maxWidth:760,margin:"auto",padding:20,paddingBottom:90}}><header style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}><div><p style={{color:"#2563eb",fontWeight:700,letterSpacing:.5}}>SMARTCHECK</p><h1>Good afternoon</h1><p style={{color:"#687386"}}>Your security workflow dashboard</p>{role&&<span style={{display:"inline-block",marginTop:4,padding:"6px 10px",borderRadius:999,background:"#eef4ff",color:"#2563eb",fontSize:12,fontWeight:700}}>{role}</span>}</div><button onClick={logout} style={{padding:"9px 12px",border:"1px solid #d7dce5",borderRadius:9,background:"white"}}>Sign out</button></header><section style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"24px 0"}}>{[["Pending","04","#dc2626"],["Active","02","#f59e0b"],["Completed","18","#16a34a"]].map(([a,b,c])=><div key={a} style={{background:"white",padding:16,borderRadius:14}}><div style={{color:c,fontWeight:700,fontSize:24}}>{b}</div><small>{a}</small></div>)}</section>{links.length>0&&<><h2>Quick actions</h2><section style={{display:"grid",gap:12,marginTop:12}}>{links.map(([title,description,href])=><Link href={href} key={href} style={{background:"white",padding:18,borderRadius:14,textDecoration:"none",color:"inherit",border:"1px solid #edf0f5"}}><b>{title}</b><p style={{margin:"8px 0 0",color:"#687386"}}>{description}</p></Link>)}</section></>}<h2 style={{marginTop:28}}>My Tasks</h2>{tasks.map(t=><div key={t.title} style={{background:"white",padding:18,borderRadius:14,marginTop:12,borderLeft:"4px solid "+t.color}}><b>{t.title}</b><p style={{margin:"8px 0",color:"#687386"}}>{t.person}</p><span style={{color:t.color,fontSize:13,fontWeight:700}}>{t.status}</span></div>)}<nav style={{position:"fixed",bottom:0,left:0,right:0,background:"white",padding:16,textAlign:"center",borderTop:"1px solid #eee"}}>Home &nbsp; · &nbsp; Tasks &nbsp; · &nbsp; Scan &nbsp; · &nbsp; More</nav></main>
}
