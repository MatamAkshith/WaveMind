import { useEffect, useState } from "react";
import {
  Check,
  CircleUserRound,
  Eye,
  EyeOff,
  Pencil,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from "../../lib/auth.js";

const REDUCE_MOTION_KEY = "wavemind_reduce_motion";

export default function Settings({ token, onTokenInvalid }) {
  const [user, setUser] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    current_password: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem(REDUCE_MOTION_KEY) === "true"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser(token)
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
          setProfileForm({
            full_name: currentUser.full_name,
            email: currentUser.email,
            current_password: "",
          });
        }
      })
      .catch((requestError) => {
        if (requestError.status === 401) onTokenInvalid();
        else if (!cancelled) setError(requestError.message);
      });
    return () => {
      cancelled = true;
    };
  }, [onTokenInvalid, token]);

  function handleReduceMotionChange(event) {
    const enabled = event.target.checked;
    setReduceMotion(enabled);
    localStorage.setItem(REDUCE_MOTION_KEY, String(enabled));
    document.documentElement.classList.toggle("reduce-motion", enabled);
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!profileForm.full_name.trim() || !profileForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      const profileUpdate = {
        full_name: profileForm.full_name.trim(),
        email: profileForm.email.trim(),
      };
      if (profileForm.current_password) {
        profileUpdate.current_password = profileForm.current_password;
      }
      const updated = await updateProfile(
        profileUpdate,
        token
      );
      setUser(updated);
      setProfileForm({
        full_name: updated.full_name,
        email: updated.email,
        current_password: "",
      });
      setEditingProfile(false);
      setSuccess("Profile details updated.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      setError("Complete every password field.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(
        {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        },
        token
      );
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setSuccess("Password updated securely.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setSavingPassword(false);
    }
  }

  function cancelProfileEdit() {
    setEditingProfile(false);
    setError("");
    if (user) {
      setProfileForm({
        full_name: user.full_name,
        email: user.email,
        current_password: "",
      });
    }
  }

  return (
    <div className="settings-content">
      <section className="settings-header">
        <div>
          <div className="eyebrow"><SettingsIcon size={14} /> YOUR SPACE</div>
          <h1>Settings.</h1>
          <p>Review your account and make this space feel comfortable.</p>
        </div>
        <div className="settings-header-icon"><SettingsIcon size={26} /></div>
      </section>

      {error && <div className="mood-tracker-error" role="alert">{error}</div>}
      {success && <div className="settings-success" role="status"><Check size={16} /> {success}</div>}

      <div className="settings-grid">
        <section className="panel settings-panel profile-settings-panel">
          <div className="settings-panel-heading">
            <CircleUserRound size={20} />
            <div>
              <div className="section-kicker">PROFILE</div>
              <h2>Your account</h2>
            </div>
            {!editingProfile && user && (
              <button
                className="secondary-button settings-edit-button"
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditingProfile(true);
                }}
              >
                <Pencil size={14} /> Edit profile
              </button>
            )}
          </div>
          {editingProfile ? (
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <label>
                Full name
                <input
                  value={profileForm.full_name}
                  onChange={(event) => updateProfileField("full_name", event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  required
                />
              </label>
              {profileForm.email.trim().toLowerCase() !== user.email.toLowerCase() && (
                <label>
                  Current password <small>Required when changing your email.</small>
                  <input
                    type="password"
                    value={profileForm.current_password}
                    onChange={(event) => updateProfileField("current_password", event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => updateProfileField("email", event.target.value)}
                  maxLength={255}
                  autoComplete="email"
                  required
                />
              </label>
              <div className="settings-form-actions">
                <button className="text-button" type="button" onClick={cancelProfileEdit}>
                  <X size={14} /> Cancel
                </button>
                <button className="primary-button compact" type="submit" disabled={savingProfile}>
                  <Save size={14} /> {savingProfile ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          ) : user ? (
            <dl className="settings-details">
              <div><dt>Full name</dt><dd>{user.full_name}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Account status</dt><dd>{user.is_active ? "Active" : "Inactive"}</dd></div>
            </dl>
          ) : !error ? (
            <p className="mood-tracker-state">Loading your account...</p>
          ) : null}
        </section>

        <section className="panel settings-panel">
          <div className="section-kicker">PREFERENCES</div>
          <h2>Comfort and accessibility</h2>
          <label className="settings-toggle">
            <span>
              <strong>Reduce motion</strong>
              <small>Use calmer transitions throughout the application.</small>
            </span>
            <input type="checkbox" checked={reduceMotion} onChange={handleReduceMotionChange} />
            <span className="settings-check" aria-hidden="true"><Check size={14} /></span>
          </label>
          <p className="settings-note">This preference is stored only in this browser.</p>
        </section>

        <section className="panel settings-panel password-settings-panel">
          <div className="settings-panel-heading">
            <ShieldCheck size={20} />
            <div>
              <div className="section-kicker">SECURITY</div>
              <h2>Change password</h2>
            </div>
          </div>
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label>
              Current password
              <span className="settings-password-field">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>
            <label>
              New password
              <span className="settings-password-field">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
              </span>
            </label>
            <label>
              Confirm new password
              <span className="settings-password-field">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"}>
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <button className="primary-button compact" type="submit" disabled={savingPassword}>
              <ShieldCheck size={14} /> {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
