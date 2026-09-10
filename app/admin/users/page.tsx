"use client";
import {useEffect,useState} from "react";

const roles=["PARENT","APPROVER","RECEPTION","SECURITY","VISITOR"] as const;
type User={id:string;name:string;username:string;mobile:string;role:string;department:string;active:boolean};

type Form={name:string;username:string;mobile:string;password:string;role:string;department:string};

export default function Users(){
  const [users,setUsers]=useState<User[]>([]);
  const [form,setForm]=useState<Form>({name:"",username:"",mobile:"",password:"",role:"PARENT",department:""});
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const r=await fetch("/api/admin/users");
    const d=await r.json();
    if(r.ok)setUsers(d.users||[]);else setError(d.error||"Unable to load users");
  }
  useEffect(()=>{void load()},[]);

  async function create(){
    setError("");
    const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Unable to create user");return;}
    setMessage(`${d.user.role} account ${d.user.username} created.`);
    setForm({name:"",username:"",mobile:"",password:"",role:"PARENT",department:""});
    void load();
  }

  const inputStyle={display:"block",width:"100%",boxSizing:"border-box" as const,padding:10,marginTop:5,border:"1px solid #d7dce5",borderRadius:8};
  return <main style={{maxWidth:950,margin:"auto",padding:24}}>
    <p style={{color:"#2563eb",fontWeight:700}}>TENANT ADMIN</p>
    <h1>Users & Access</h1>
    <p style={{color:"#687386"}}>Create school-issued accounts and assign the required operational role.</p>
    {message&&<p style={{color:"#15803d",fontWeight:700}}>{message}</p>}
    {error&&<p style={{color:"#dc2626",fontWeight:700}}>{error}</p>}
    <section style={{background:"white",padding:22,borderRadius:14}}>
      <h2>Create User</h2>
      <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputStyle}/></label>
      <label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={inputStyle}/></label>
      <label>Mobile<input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} style={inputStyle}/></label>
      <label>Department<input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}/></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={inputStyle}/></label>
      <label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={inputStyle}>{roles.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
      <button onClick={()=>void create()} style={{marginTop:18,padding:"12px 18px",border:0,borderRadius:8,background:"#2563eb",color:"white",fontWeight:700}}>Create Account</button>
    </section>
    <h2 style={{marginTop:28}}>Current Users</h2>
    {users.map(u=><article key={u.id} style={{background:"white",padding:16,borderRadius:10,marginTop:9}}><b>{u.name}</b> · {u.role}<div style={{color:"#687386"}}>{u.username} · {u.mobile||"No mobile"} · {u.department||"No department"}</div></article>)}
  </main>;
}
