import { useState } from "react";
import { T } from "../tokens.js";
import { Card, Btn, Input, Alert } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthApi } from "../api/client.js";

export function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab]         = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState("");

  // Shared fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Investor/Distributor extra fields
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan]     = useState("");
  const [arn, setArn]     = useState("");

  const reset = () => { setErr(""); setSuccess(""); };

  const handleLogin = async e => {
    e.preventDefault(); reset(); setLoading(true);
    try { await login(username, password); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const handleInvestorSignup = async e => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await AuthApi.signupInvestor({ name, email, panNumber: pan, username, password });
      setSuccess("Account created! Signing you in…");
      await login(username, password);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const handleDistSignup = async e => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const res = await AuthApi.signupDistributor({ name, arnCode: arn, email, username, password });
      setSuccess(res.message || "Registered! Signing you in…");
      await login(username, password);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const tabStyle = active => ({
    flex: 1, padding: "10px 0", fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? T.white : "transparent",
    color: active ? T.navy : T.slate,
    border: "none", cursor: "pointer", borderRadius: 6,
    transition: "all .15s",
  });

  const formStyle = { display: "flex", flexDirection: "column", gap: 14, marginTop: 16 };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: T.navy,
    }}>
      <div style={{ width: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: T.white, letterSpacing: "-.02em" }}>
            MF Platform
          </div>
          <div style={{ fontSize: 14, color: T.slateL, marginTop: 6 }}>
            Mutual Fund Management System
          </div>
        </div>

        <Card style={{ borderRadius: 16 }}>
          {/* Tab bar */}
          <div style={{ display: "flex", background: T.bg, borderRadius: 8, padding: 4, marginBottom: 20 }}>
            {[["login","Sign In"],["investor","Investor"],["distributor","Distributor"]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); reset(); }} style={tabStyle(tab === id)}>
                {label}
              </button>
            ))}
          </div>

          <Alert msg={err} type="error" />
          <Alert msg={success} type="success" />

          {tab === "login" && (
            <form onSubmit={handleLogin} style={formStyle}>
              <Input label="Username" value={username} onChange={setUsername} required />
              <Input label="Password" type="password" value={password} onChange={setPassword} required />
              <Btn type="submit" disabled={loading} style={{ justifyContent: "center" }}>
                {loading ? "Signing in…" : "Sign In"}
              </Btn>
              <div style={{ fontSize: 12, color: T.slate, textAlign: "center", marginTop: 4 }}>
                Default admin: <strong>admin</strong> / <strong>ChangeMe123!</strong>
              </div>
            </form>
          )}

          {tab === "investor" && (
            <form onSubmit={handleInvestorSignup} style={formStyle}>
              <Input label="Full Name" value={name} onChange={setName} required />
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="PAN Number" value={pan} onChange={setPan} placeholder="ABCDE1234F" required />
              <Input label="Username" value={username} onChange={setUsername} required />
              <Input label="Password" type="password" value={password} onChange={setPassword} required />
              <Btn type="submit" disabled={loading} style={{ justifyContent: "center" }}>
                {loading ? "Creating account…" : "Create Investor Account"}
              </Btn>
            </form>
          )}

          {tab === "distributor" && (
            <form onSubmit={handleDistSignup} style={formStyle}>
              <Input label="Distributor / Firm Name" value={name} onChange={setName} required />
              <Input label="ARN Code" value={arn} onChange={setArn} placeholder="ARN-12345" required />
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Username" value={username} onChange={setUsername} required />
              <Input label="Password" type="password" value={password} onChange={setPassword} required />
              <Btn type="submit" variant="gold" disabled={loading} style={{ justifyContent: "center" }}>
                {loading ? "Registering…" : "Register as Distributor"}
              </Btn>
              <div style={{ fontSize: 12, color: T.slate, textAlign: "center" }}>
                ARN verification completes automatically within ~60 seconds.
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
