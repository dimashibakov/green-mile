import Link from "next/link";
import { CAT_ORDER, CAT_LABELS } from "@/lib/categories";
import { signUp } from "./actions";

export default function RegisterPage({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <main className="device" role="application" aria-label="Green Mile register">
      <div className="brandbar">
        <span className="logo">
          i-551<span className="b" aria-hidden="true"></span>
        </span>{" "}
        <span>migration tracker</span> <span className="ver">new profile</span>
      </div>
      <div className="auth">
        <div className="authprompt">
          <span className="u">guest@i-551</span> <span className="dollar">$</span>{" "}
          <span className="cmd">register --new</span>
          <span className="caret" aria-hidden="true"></span>
        </div>
        <div className="comment">// create your resident profile. this seeds your tracker.</div>
        <form action={signUp}>
          <div className="field">
            <label className="lbl" htmlFor="handle">handle <span className="gt">&gt;</span></label>
            <input id="handle" name="handle" placeholder="dima" autoComplete="nickname" />
          </div>
          <div className="field">
            <label className="lbl" htmlFor="email">email <span className="gt">&gt;</span></label>
            <input id="email" name="email" type="email" placeholder="you@resident.io" autoComplete="email" />
          </div>
          <div className="field">
            <label className="lbl" htmlFor="password">password <span className="gt">&gt;</span></label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
          </div>
          <div className="field">
            <label className="lbl" htmlFor="category">gc category <span className="gt">&gt;</span></label>
            <select id="category" name="category" defaultValue="E16">
              {CAT_ORDER.map((c) => (
                <option key={c} value={c}>
                  {c}
                  {CAT_LABELS[c] ? "  ·  " + CAT_LABELS[c] : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field two">
            <div>
              <label className="lbl" htmlFor="resident_since">resident since <span className="gt">&gt;</span></label>
              <input id="resident_since" name="resident_since" type="date" />
            </div>
            <div>
              <label className="lbl" htmlFor="card_expires">card expires <span className="gt">&gt;</span></label>
              <input id="card_expires" name="card_expires" type="date" />
            </div>
          </div>
          <div className="err">{searchParams.e ? "// error: " + searchParams.e : ""}</div>
          <button className="btn primary block" type="submit">[ create profile ]</button>
        </form>
        <div className="linkline">
          // already registered?{" "}
          <Link className="cmd-link" href="/login">$ login</Link>
        </div>
      </div>
    </main>
  );
}
