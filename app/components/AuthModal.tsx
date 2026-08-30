"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { X, Mail, Lock, User, Eye, EyeOff, LogOut, Phone } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = "login" | "register" | "profile" | "forgot" | "phone" | "phone-verify";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
   const { t, language } = useLanguage();
  const { user, isAuthenticated, login, register, resetPassword, logout, googleLogin, updateProfile, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    countryCode: "+91",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (view === "login") {
        await login(formData.email, formData.password);
        onClose();
      } else if (view === "register") {
        await register(formData.name, formData.email, formData.password);
        onClose();
      } else if (view === "profile") {
        await updateProfile({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
        });
        onClose();
      } else if (view === "forgot") {
        await resetPassword(formData.email);
        setSuccess(t.auth.successPasswordReset);
      } else if (view === "phone") {
        const fullPhone = formData.countryCode + formData.phone;
        await sendPhoneOtp(fullPhone);
        setSuccess(t.auth.successOtpSent);
        setOtpResendCountdown(30);
        setView("phone-verify");
      } else if (view === "phone-verify") {
        const fullPhone = formData.countryCode + formData.phone;
        await verifyPhoneOtp(fullPhone, formData.otp);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || t.auth.errorSomethingWentWrong);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    try {
      const fullPhone = formData.countryCode + formData.phone;
       await sendPhoneOtp(fullPhone);
       setSuccess(t.auth.successOtpResent);
       setOtpResendCountdown(30);
      } catch (err: any) {
        setError(err.message || t.auth.errorSomethingWentWrong);
      }
    };

    const handleGoogle = async () => {
    setError("");
    setSuccess("");
    try {
      await googleLogin();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError("");
    setSuccess("");
    if (newView === "profile" && user) {
      setFormData(prev => ({
        ...prev,
        birthDate: user.birthDate || "",
        birthTime: user.birthTime || "",
        birthPlace: user.birthPlace || "",
      }));
    }
  };

  useEffect(() => {
    if (otpResendCountdown > 0) {
      const timer = setTimeout(() => setOtpResendCountdown(otpResendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendCountdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
             {view === "login" && t.auth.titleLogin}
             {view === "register" && t.auth.titleRegister}
             {view === "profile" && t.auth.titleProfile}
             {view === "forgot" && t.auth.titleForgot}
             {view === "phone" && t.auth.titlePhone}
             {view === "phone-verify" && t.auth.titlePhoneVerify}
           </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          )}

          {isAuthenticated && view === "profile" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{user?.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.auth.labelBirthDate}</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.auth.labelBirthTime}</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.auth.labelBirthPlace}</label>
                   <input
                     type="text"
                     placeholder={t.auth.placeholderBirthPlace}
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                   {isLoading ? t.auth.buttonSaving : t.auth.buttonSaveProfile}
                </button>
              </form>

              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full mt-4 py-3 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                 <LogOut className="w-4 h-4" />
                 {t.auth.buttonSignOut}
              </button>
            </div>
          ) : (
            <>
              {view !== "forgot" && view !== "phone" && view !== "phone-verify" && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="w-full py-3 mb-4 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-medium hover:bg-[var(--hover-bg)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                     {t.auth.buttonContinueGoogle}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border-color)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[var(--card-bg)] text-[var(--text-muted)]">{t.auth.dividerText}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => switchView("phone")}
                    disabled={isLoading}
                    className="w-full py-3 mb-4 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-medium hover:bg-[var(--hover-bg)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     <Phone className="w-5 h-5" />
                     {t.auth.buttonContinuePhone}
                  </button>
                </>
              )}

              {view === "phone" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.auth.labelPhoneNumber}</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                         className="w-1/3 px-3 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                       >
                        {t.placeSearch.countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {language === "hi" ? c.hi : c.en} ({c.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                         placeholder={t.auth.placeholderPhone}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoComplete="tel"
                        required
                        className="w-2/3 px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.phone}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                  >
                     {isLoading ? t.auth.buttonSending : t.auth.buttonSendOtp}
                  </button>
                </form>
              )}

              {view === "phone-verify" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                       {t.auth.labelOtp.replace("{phone}", formData.countryCode + formData.phone)}
                     </label>
                     <input
                       type="text"
                       inputMode="numeric"
                       pattern="[0-9]{6}"
                       placeholder={t.auth.placeholderOtp}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      autoComplete="one-time-code"
                      required
                      className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-center text-2xl tracking-widest"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || formData.otp.length < 6}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                  >
                     {isLoading ? t.auth.buttonVerifying : t.auth.buttonVerifyAndSignIn}
                  </button>
                  <div className="text-center">
                    {otpResendCountdown > 0 ? (
                         <span className="text-sm text-[var(--text-secondary)]">
                           {t.auth.labelResendIn.replace("{seconds}", String(otpResendCountdown))}
                         </span>
                     ) : (
                       <button
                         type="button"
                         onClick={handleResendOtp}
                         disabled={isLoading}
                         className="text-sm text-amber-500 hover:text-amber-400 font-medium"
                       >
                         {t.auth.buttonResendOtp}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {view !== "phone" && view !== "phone-verify" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === "register" && (
                  <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                 <input
                   type="text"
                   placeholder={t.auth.placeholderFullName}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                )}

                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                   <input
                     type="email"
                     placeholder={t.auth.placeholderEmail}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                {view !== "forgot" && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                       <input
                         type={showPassword ? "text" : "password"}
                         placeholder={t.auth.placeholderPassword}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        autoComplete={view === "login" ? "current-password" : "new-password"}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      <button
                        type="button"
                         aria-label={showPassword ? t.auth.ariaHidePassword : t.auth.ariaShowPassword}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {view === "login" && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => switchView("forgot")}
                          className="text-sm text-amber-500 hover:text-amber-400 font-medium"
                        >
                           {t.auth.linkForgotPassword}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                   {isLoading
                     ? view === "forgot" ? t.auth.buttonSending : t.auth.buttonPleaseWait
                     : view === "login" ? t.auth.titleLogin
                     : view === "register" ? t.auth.titleRegister
                     : t.auth.buttonSendResetLink}
                </button>
              </form>
              )}

              <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                {view === "forgot" ? (
                  <button onClick={() => switchView("login")} className="text-amber-500 hover:text-amber-400 font-medium">
                    {t.auth.linkBackToLogin}
                  </button>
                ) : view === "login" ? (
                  <>
                    {t.auth.textNoAccount}{" "}
                    <button onClick={() => switchView("register")} className="text-amber-500 hover:text-amber-400 font-medium">
                      {t.auth.linkSignUp}
                    </button>
                  </>
                ) : view === "register" ? (
                  <>
                    {t.auth.textHaveAccount}{" "}
                    <button onClick={() => switchView("login")} className="text-amber-500 hover:text-amber-400 font-medium">
                      {t.auth.linkSignIn}
                    </button>
                  </>
                ) : view === "phone" || view === "phone-verify" ? (
                  <button onClick={() => switchView("login")} className="text-amber-500 hover:text-amber-400 font-medium">
                    {t.auth.linkBackToLogin}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
