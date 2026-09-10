"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

const destinations:Record<string,string>={PLATFORM_ADMIN:"/platform-admin",ADMIN:"/admin",PARENT:"/parent",VISITOR:"/visitor",APPROVER:"/approvals",RECEPTION:"/reception",SECURITY:"/security/scan"};

export default function Login(){
  const [usernameOrMobile,setUsernameOrMobile]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();

  async function signIn(){
    setLoading(true);setError("");
    try{
      const response=await fetch("/api/auth/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({usernameOrMobile,password})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to sign in");
      const next=new URL(window.location.href).searchParams.get("next");
      router.replace(next||destinations[data.user.role]||"/dashboard");
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Unable to sign in");setLoading(false)}
  }

  return <main style={{maxWidth:440,margin:"0 auto",padding:24,minHeight:"100vh",display:"flex",alignItems:"center"}}><section style={{width:"100%",background:"white",padding:28,borderRadius:16,boxShadow:"0 10px 30px rgba(0,0,0,.06)"}}><p style={{color:"#2563eb",fontWeight:700,letterSpacing:.5}}>SMARTCHECK</p><h1 style={{marginBottom:8}}>Sign in</h1><p style={{color:"#687386",lineHeight:1.5}}>Use the username or mobile number and password provided by your school or organisation.</p><label style={{display:"block",marginTop:20,fontWeight:600}}>Username or mobile<input value={usernameOrMobile} onChange={e=>setUsernameOrMobile(e.target.value)} autoComplete="username" style={{display:"block",width:"100%",boxSizing:"border-box",padding:14,marginTop:7,border:"1px solid #d7dce5",borderRadius:10}}/></label><label style={{display:"block",marginTop:16,fontWeight:600}}>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void signIn()}} autoComplete="current-password" style={{display:"block",width:"100%",boxSizing:"border-box",padding:14,marginTop:7,border:"1px solid #d7dce5",borderRadius:10}}/></label><button onClick={()=>void signIn()} disabled={loading||!usernameOrMobile||!password} style={{width:"100%",marginTop:20,padding:14,border:0,borderRadius:10,background:"#2563eb",color:"white",fontWeight:700}}>{loading?"Signing in…":"Sign in"}</button>{error&&<p style={{color:"#dc2626",marginTop:14}}>{error}</p>}<small style={{display:"block",marginTop:18,color:"#687386"}}>Visitors will use phone OTP verification in a later release.</small></section></main>
}
