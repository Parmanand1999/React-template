import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  forgotPasswordApi,
  resendOtpApi,
  resetPasswordApi,
} from "@/Services/authService";
import ttsLogoUrl from "@/assets/tts-logo.png";
import airplane from "@/assets/loginPageImg/airplane.png";

// Step 1 Validation Schema: Email only
const step1Schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

// Step 2 Validation Schema: OTP + New Password + Confirm Password
const step2Schema = z
  .object({
    otp: z
      .string()
      .min(1, "OTP is required")
      .regex(/^\d{6}$/, "otp must be a 6-digit numeric code"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "newPassword must be longer than or equal to 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Reset
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Form for Step 1
  const formStep1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  });

  // Form for Step 2
  const formStep2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  // Resend OTP Countdown Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Step 1 Submit: Call /api/v1/auth/forgot-password with { email }
  const onStep1Submit = async (data) => {
    setLoading(true);
    try {
      const response = await forgotPasswordApi({ email: data.email });
      if (response?.status === 200 || response?.status === 201) {
        setUserEmail(data.email);
        setStep(2);
        setResendTimer(56);
        toast.success(
          response?.data?.message || "OTP code sent to your email!"
        );
      } else {
        toast.error(response?.data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Forgot Password API Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP: Call /api/v1/auth/resend-otp with { email }
  const handleResendOtp = async () => {
    if (!userEmail) return;
    setResendLoading(true);
    try {
      const response = await resendOtpApi({ email: userEmail });
      if (response?.status === 200 || response?.status === 201) {
        setResendTimer(56);
        toast.success(
          response?.data?.message || "OTP resent successfully to your email!"
        );
      } else {
        toast.error(response?.data?.message || "Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend OTP. Try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2 Submit: Call /api/v1/auth/reset-password with { email, otp, newPassword }
  const onStep2Submit = async (data) => {
    setLoading(true);
    try {
      const response = await resetPasswordApi({
        email: userEmail,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          response?.data?.message || "Password reset successfully!"
        );
        navigate("/login");
      } else {
        toast.error(response?.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset Password API Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Invalid OTP or password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const timerFormatted =
    resendTimer > 0
      ? `00:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}s`
      : "00:00s";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#f8fafc] text-slate-800 selection:bg-blue-200">
      {/* ========================================== */}
      {/* LEFT SIDE: Royal Blue Brand Overview Panel  */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-[50%] bg-[#3456A7] text-white p-6 sm:p-10 lg:px-24 pt-10 lg:pt-12 pb-10 flex-col justify-start relative overflow-hidden shrink-0">
        {/* Top Right Airplane & Dotted Path */}
        <div className="absolute top-0 right-1 w-30 h-30 opacity-25 pointer-events-none">
          <img
            src={airplane}
            alt="TTS"
            className="w-full h-full object-contain brightness-0 invert rotate-180"
          />
        </div>

        {/* Bottom Left Airplane & Dotted Path */}
        <div className="absolute bottom-6 left-1 w-30 h-30 opacity-25 pointer-events-none">
          <img
            src={airplane}
            alt="TTS"
            className="w-full h-full object-contain brightness-0 invert"
          />
        </div>

        {/* Left Side Content Container */}
        <div className="max-w-lg mx-auto lg:mx-0 z-10 space-y-4 lg:space-y-5 mt-2 lg:mt-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[35px] font-semibold tracking-tight text-[#67e8f9] leading-none">
              Travel Tech
            </h1>
            <h1 className="text-2xl sm:text-3xl lg:text-[35px] font-semibold tracking-tight text-[#67e8f9] leading-tight pb-3">
              Services LLP.
            </h1>
            <div className="h-1 w-24 bg-[#38bdf8] rounded-full mt-1" />
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-normal text-white leading-snug">
              Every refund, calculated automatically.
            </h2>
            <p className="text-xs sm:text-xs lg:text-[12px] text-blue-100/90 leading-relaxed font-normal max-w-md">
              Reads GDS and LCC ticket data, applies fare rules, and produces a
              precise refund calculation &mdash; no manual rework, even on the
              most complex fares.
            </p>
          </div>

          <div className="space-y-3.5 pt-0">
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              Automation Capabilities
            </h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="bg-[#2a468d]/60 p-2.5 rounded-xl border border-blue-300/10">
                <h4 className="font-normal text-[#FFE8A3E5]">
                  1. Precise on complex fares
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-3">
                  Multi-sector and penalty-heavy fares get the same accuracy as
                  simple ones.
                </p>
              </div>

              <div className="bg-[#2a468d]/60 p-2.5 rounded-xl border border-blue-300/10">
                <h4 className="font-normal text-[#FFE8A3E5]">
                  2. Native GDS and LCC coverage
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-3">
                  Ticket data is read directly from source, with no manual
                  re-entry.
                </p>
              </div>

              <div className="bg-[#2a468d]/60 p-2.5 rounded-xl border border-blue-300/10">
                <h4 className="font-normal text-[#FFE8A3E5]">
                  3. Zero manual steps, request to disbursal
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-3">
                  One validated pipeline carries every case through to payout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE: Reset Password Wizard Card      */}
      {/* ========================================== */}
      <div className="flex-1 bg-[#f8fafc] p-4 sm:p-8 flex flex-col items-center justify-between min-h-screen overflow-y-auto">
        {/* Top Official TTS Logo Header */}
        <div className="pt-2 pb-4 flex flex-col items-center">
          <img
            src={ttsLogoUrl}
            alt="Travel Tech Services (TTS)"
            className="h-18 w-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Centered Royal Blue Reset Password Card (#3456A7) */}
        <div className="w-full max-w-sm bg-[#3456A7] rounded-2xl p-6 sm:p-7 shadow-2xl text-white my-auto border border-blue-400/20 relative transition-all duration-300">
          
          {/* Header Row with Back Button & Title */}
          <div className="relative flex items-center justify-center mb-1">
            <Link
              to={step === 1 ? "/login" : "#"}
              onClick={(e) => {
                if (step === 2) {
                  e.preventDefault();
                  setStep(1);
                }
              }}
              className="absolute left-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              title={step === 1 ? "Back to Login" : "Back to Step 1"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-lg sm:text-xl font-bold text-white text-center">
              {step === 1 ? "Forgot Password?" : "Reset Password"}
            </h2>
          </div>

          <p className="text-xs text-blue-100/90 text-center mb-4 font-normal">
            {step === 1
              ? "Enter your email to receive a 6-digit verification OTP"
              : `Enter OTP & new password for ${userEmail}`}
          </p>

          {/* Step Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 1 ? "w-8 bg-[#FFE8A3]" : "w-2 bg-white/40"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 2 ? "w-8 bg-[#FFE8A3]" : "w-2 bg-white/40"
              }`}
            />
          </div>

          {/* ========================================== */}
          {/* STEP 1 FORM: EMAIL ID INPUT & SEND OTP     */}
          {/* ========================================== */}
          {step === 1 && (
            <form
              onSubmit={formStep1.handleSubmit(onStep1Submit)}
              className="space-y-4 animate-fadeIn"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#67e8f9]" /> Email ID
                </label>
                <Input
                  type="email"
                  placeholder="name@gmail.com"
                  {...formStep1.register("email")}
                  className="h-9 w-full rounded-lg bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3 shadow-inner placeholder:text-slate-400"
                />
                {formStep1.formState.errors.email && (
                  <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                    {formStep1.formState.errors.email.message}
                  </p>
                )}
              </div>

              <CustomButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full h-10 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-md transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-6 cursor-pointer border-none"
              >
                Send OTP
              </CustomButton>
            </form>
          )}

          {/* ========================================== */}
          {/* STEP 2 FORM: OTP + NEW PASSWORD + SAVE     */}
          {/* ========================================== */}
          {step === 2 && (
            <form
              onSubmit={formStep2.handleSubmit(onStep2Submit)}
              className="space-y-3.5 animate-fadeIn"
            >
              {/* OTP Field with Resend OTP Link */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#67e8f9]" /> OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading || resendTimer > 0}
                    className={`text-[11px] transition-colors ${
                      resendTimer > 0 || resendLoading
                        ? "text-blue-200/80 cursor-default"
                        : "text-[#FFE8A3] hover:underline cursor-pointer font-semibold"
                    }`}
                  >
                    {resendLoading ? "Sending..." : "Resend code?"}{" "}
                    <span className="font-semibold text-white">
                      {timerFormatted}
                    </span>
                  </button>
                </div>

                <Input
                  type="text"
                  placeholder="enter 6 digit code"
                  {...formStep2.register("otp")}
                  className="h-9 w-full rounded-lg bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3 shadow-inner placeholder:text-slate-400 tracking-wider"
                />
                {formStep2.formState.errors.otp && (
                  <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                    {formStep2.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#67e8f9]" /> New Password
                </label>

                <div className="relative flex items-center">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="enter new password"
                    {...formStep2.register("newPassword")}
                    className="h-9 w-full rounded-lg bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3 pr-10 shadow-inner placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formStep2.formState.errors.newPassword && (
                  <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                    {formStep2.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#67e8f9]" /> Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="confirm password"
                    {...formStep2.register("confirmPassword")}
                    className="h-9 w-full rounded-lg bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3 pr-10 shadow-inner placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formStep2.formState.errors.confirmPassword && (
                  <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                    {formStep2.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Save Password Button */}
              <CustomButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full h-10 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-md transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-5 cursor-pointer border-none"
              >
                Save Password
              </CustomButton>

              {/* Change Email Option */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-blue-200 hover:text-white transition-colors cursor-pointer hover:underline"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Subtext Below Card */}
        <div className="text-center text-[11px] text-slate-500 font-normal max-w-xs sm:max-w-sm mt-4 mb-2 leading-relaxed">
          Backed by travel professionals with 100+ combined years leading top
          European and Indian airlines.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
