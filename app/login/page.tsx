import Link from "next/link";
import { signIn } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { e?: string; message?: string };
}) {
  return (
    <main className="device" role="application" aria-label="Green Mile login">
      <div className="brandbar">
        <span className="logo">
          i-551<span className="b" aria-hidden="true"></span>
        </span>{" "}
        <span>migration tracker</span> <span className="ver">green mile</span>
      </div>
      <div className="auth">
        <div className="authprompt">
          <span className="u">guest@i-551</span> <span className="dollar">$</span>{" "}
          <span className="cmd">login</span>
          <span className="caret" aria-hidden="true"></span>
        </div>
        <div className="comment">// enter your credentials to resume tracking.</div>
        {searchParams.message && (
          <div className="comment" style={{ color: "var(--green)" }}>
            // {searchParams.message}
          </div>
        )}
        <form action={signIn}>
          <div className="field">
            <label className="lbl" htmlFor="email">
              email <span className="gt">&gt;</span>
            </label>
            <input id="email" name="email" type="email" placeholder="you@resident.io" autoComplete="username" />
          </div>
          <div className="field">
            <label className="lbl" htmlFor="password">
              passwd <span className="gt">&gt;</span>
            </label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div className="err">{searchParams.e ? "// error: " + searchParams.e : ""}</div>
          <button className="btn primary block" type="submit">
            [ sign in ]
          </button>
        </form>
        <div className="linkline">
          // no account yet?{" "}
          <Link className="cmd-link" href="/register">
            $ register
          </Link>
        </div>
      </div>
    </main>
  );
}
