import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!request.cookies.get("gm-theme")) {
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single();
      const t = data?.theme === "light" ? "light" : "dark";
      response.cookies.set("gm-theme", t, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";

  const themeOpts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
  const themeCookie = response.cookies.get("gm-theme");

  if (!user && path.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    if (themeCookie) redirect.cookies.set("gm-theme", themeCookie.value, themeOpts);
    return redirect;
  }
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    const redirect = NextResponse.redirect(url);
    if (themeCookie) redirect.cookies.set("gm-theme", themeCookie.value, themeOpts);
    return redirect;
  }

  return response;
}
