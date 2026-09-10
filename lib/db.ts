import {Pool,type PoolClient} from "pg";

let pool:Pool|undefined;

export function getPool(){
  const url=process.env.DATABASE_URL;
  if(!url)throw new Error("DATABASE_URL is not configured");
  if(!pool)pool=new Pool({connectionString:url,ssl:process.env.NODE_ENV==="production"?{rejectUnauthorized:false}:undefined,max:5,idleTimeoutMillis:10000});
  return pool;
}

export async function withTransaction<T>(fn:(client:PoolClient)=>Promise<T>){
  const client=await getPool().connect();
  try{await client.query("BEGIN");const result=await fn(client);await client.query("COMMIT");return result;}
  catch(error){await client.query("ROLLBACK");throw error;}
  finally{client.release();}
}
