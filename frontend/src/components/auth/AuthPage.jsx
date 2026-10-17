import { useState } from "react";
import { Eye, EyeOff, Heart, LogIn, UserPlus } from "lucide-react";
import { login, register } from "../../lib/auth.js";

const initialRegistration = {
  full_name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function ErrorMessage({ children }) {
  return <div className="auth-message auth-error" role="alert">{children}</div>;
}

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [registration, setRegistration] = useState(initialRegistration);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  function validateRegistration() {
    if (!registration.full_name.trim() || !registration.email.trim() ||
        !registration.password || !registration.confirmPassword) {
      return "Please complete every field.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(registration.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (registration.password.length < 8) return "Password must be at least 8 characters.";
    if (registration.password.length > 128) return "Password must be 128 characters or fewer.";
    if (registration.password !== registration.confirmPassword) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (mode === "register") {
      const validationError = validateRegistration();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(registration);
        setRegistration(initialRegistration);
        setMode("login");
        setSuccess("Your account is ready. Sign in to enter your space.");
        return;
      }
      const response = await login(credentials);
      onLogin(response.access_token);
    } catch (requestError) {
      setError(
        requestError.status === 409
          ? "An account with this email already exists. Try logging in instead."
          : requestError.message || "Unable to complete the request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const values = mode === "login" ? credentials : registration;
  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="WaveMind introduction">
        <div className="auth-brand"><span className="auth-brand-mark"><Heart size={20} /></span> wavemind<span>.</span></div>
        <div className="auth-visual-copy">
          <div className="eyebrow">YOUR SPACE TO GROW</div>
          <h1>A calmer way to move through your day.</h1>
          <p>Make room for reflection, meaningful progress, and the parts of life that deserve your attention.</p>
        </div>
        <div className="auth-wave" aria-hidden="true" />
      </section>
      <section className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-card-icon">{mode === "login" ? <LogIn size={22} /> : <UserPlus size={22} />}</div>
          <div className="eyebrow">{mode === "login" ? "WELCOME BACK" : "BEGIN YOUR JOURNEY"}</div>
          <h2>{mode === "login" ? "Welcome back to your space." : "Create your WaveMind space."}</h2>
          <p className="auth-subtitle">
            {mode === "login" ? "Your private place to reflect, reset, and grow." : "A private space for your emotional wellness and personal growth."}
          </p>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <div className="auth-message auth-success" role="status">{success}</div>}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <label>Full name<input value={registration.full_name} onChange={(e) => setRegistration({ ...registration, full_name: e.target.value })} autoComplete="name" required /></label>
            )}
            <label>Email<input type="email" value={values.email} onChange={(e) => mode === "login" ? setCredentials({ ...credentials, email: e.target.value }) : setRegistration({ ...registration, email: e.target.value })} autoComplete="email" required /></label>
            <label>Password
              <span className="auth-password-field">
                <input type={showPassword ? "text" : "password"} value={values.password} onChange={(e) => mode === "login" ? setCredentials({ ...credentials, password: e.target.value }) : setRegistration({ ...registration, password: e.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required />
                <button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </span>
            </label>
            {mode === "register" && <label>Confirm password<input type="password" value={registration.confirmPassword} onChange={(e) => setRegistration({ ...registration, confirmPassword: e.target.value })} autoComplete="new-password" minLength={8} required /></label>}
            <button className="primary-button auth-submit" type="submit" disabled={submitting}>
              {submitting ? (mode === "login" ? "Signing in..." : "Creating account...") : mode === "login" ? "Sign in" : "Create account"}
              {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            </button>
          </form>
          <button className="auth-switch-button" type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "New to WaveMind? Create an account" : "Already have an account? Log in"}
          </button>
        </div>
      </section>
    </main>
  );
}
