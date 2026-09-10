import {NextRequest,NextResponse} from "next/server";
import {allowedRolesForPath,isPublicPath} from "@/lib/auth/route-policy";
import {SESSION_COOKIE,verifySessionToken} from "@/lib/auth/session";

export default function proxy(request:NextRequest){
  const {pathname}=request.nextUrl;
  if(isPublicPath(pathname))return NextResponse.next();
  const allowed=allowedRolesForPath(pathname);
  if(!allowed)return NextResponse.next();
  const session=verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if(!session||!allowed.includes(session.role)){
    const url=request.nextUrl.clone();
    url.pathname="/login";
    url.searchParams.set("next",pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config={matcher:["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)"]};
