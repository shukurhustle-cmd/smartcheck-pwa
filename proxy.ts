import {NextRequest,NextResponse} from "next/server";
import {allowedRolesForPath,isPublicPath,isValidRole} from "@/lib/auth/route-policy";

export function proxy(request:NextRequest){
  const {pathname}=request.nextUrl;
  if(isPublicPath(pathname))return NextResponse.next();

  const role=request.cookies.get("smartcheck_role")?.value;
  const allowed=allowedRolesForPath(pathname);

  if(!allowed)return NextResponse.next();
  if(!isValidRole(role)||!allowed.includes(role)){
    const url=request.nextUrl.clone();
    url.pathname="/login";
    url.searchParams.set("next",pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config={matcher:["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)"]};
