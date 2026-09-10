import {getPool} from "@/lib/db";

export type Notification={id:string;recipient:string;role:string;title:string;message:string;ticketId?:string;read:boolean;createdAt:string};

export async function createNotification(input:{tenantId:string;userId:string;title:string;message:string;ticketDbId?:string;type?:string}){
  const row=(await getPool().query(`INSERT INTO notifications(tenant_id,user_id,ticket_id,type,title,message) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,title,message,ticket_id,read_at,created_at`,[input.tenantId,input.userId,input.ticketDbId||null,input.type||"INFO",input.title,input.message])).rows[0];
  return {id:row.id,recipient:input.userId,role:"",title:row.title,message:row.message,ticketId:row.ticket_id||undefined,read:Boolean(row.read_at),createdAt:row.created_at.toISOString()};
}

export async function listNotifications(userId:string){
  const rows=(await getPool().query(`SELECT n.id,n.title,n.message,n.ticket_id,n.read_at,n.created_at,u.role FROM notifications n JOIN users u ON u.id=n.user_id WHERE n.user_id=$1 ORDER BY n.created_at DESC`,[userId])).rows;
  return rows.map(r=>({id:r.id,recipient:userId,role:r.role,title:r.title,message:r.message,ticketId:r.ticket_id||undefined,read:Boolean(r.read_at),createdAt:r.created_at.toISOString()}));
}
