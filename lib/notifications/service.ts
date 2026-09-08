import {appendRow,getRows} from "@/lib/google/sheets-client";

export type Notification={id:string;recipient:string;role:string;title:string;message:string;ticketId?:string;read:boolean;createdAt:string};

export async function createNotification(input:Omit<Notification,"id"|"read"|"createdAt">){
  const item:Notification={...input,id:"NTF-"+crypto.randomUUID(),read:false,createdAt:new Date().toISOString()};
  await appendRow("NOTIFICATIONS",[item.id,item.recipient,item.role,item.title,item.message,item.ticketId||"",String(item.read),item.createdAt]);
  return item;
}

export async function listNotifications(recipient?:string,role?:string){
  const rows=await getRows("NOTIFICATIONS");
  return rows.slice(1).filter(r=>!recipient&&!role||String(r[1]||"")===String(recipient||"")||String(r[2]||"")===String(role||"")).map(r=>({id:String(r[0]||""),recipient:String(r[1]||""),role:String(r[2]||""),title:String(r[3]||""),message:String(r[4]||""),ticketId:String(r[5]||"")||undefined,read:String(r[6]).toLowerCase()==="true",createdAt:String(r[7]||"")})).reverse();
}