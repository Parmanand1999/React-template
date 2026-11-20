import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";
import {
  Eye,
  EyeOff,
  Globe
} from "lucide-react";
import { loginWithEmail } from "@/Services/authService";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import ttsLogoUrl from "@/assets/tts-logo.png";
import airplane from "@/assets/loginPageImg/airplane.png";


// Zod Validation Schema for Email & Password Login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email/Username is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => Boolean(state?.accessToken));

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle Form Submit
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await loginWithEmail({
        email: data.email,
        password: data.password,
      });

      if (response?.status === 200 || response?.status === 201) {
        const responseData = response?.data?.data || response?.data;

        const authData = {
          userDetails: {
            userId: responseData?.userId || responseData?.user?._id || "1",
            name: responseData?.name || responseData?.user?.name || data.email.split("@")[0],
            roleName: responseData?.roleName || responseData?.user?.role || "Admin",
            email: data.email,
          },
          accessToken: responseData?.token || responseData?.accessToken,
          refreshToken: responseData?.refreshToken || null,
        };

        login(authData, authData.accessToken);
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        toast.error(response?.data?.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#f8fafc] text-slate-800 selection:bg-blue-200">

      {/* ========================================== */}
      {/* LEFT SIDE: Royal Blue Brand Overview Panel  */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-[50%] bg-[#3456A7] text-white p-6 sm:p-10 lg:px-24 pt-10 lg:pt-12 pb-10 flex-col justify-start relative overflow-hidden shrink-0">

        {/* Background Flight Path Dotted SVGs */}
        {/* Top Right Airplane & Dotted Path */}
        <div className="absolute top-0 right-1 w-30 h-30 opacity-25 pointer-events-none">
          <img src={airplane} alt="TTS" className="w-full h-full object-contain brightness-0 invert rotate-180" />
        </div>

        {/* Bottom Left Airplane & Dotted Path */}
        <div className="absolute bottom-12 left-1 w-30 h-30 opacity-25 pointer-events-none">
          <img src={airplane} alt="TTS" className="w-full h-full object-contain brightness-0 invert " />
        </div>

        {/* Left Side Content Container */}
        <div className="max-w-lg mx-auto lg:mx-0 z-10 space-y-4 lg:space-y-5 mt-2 lg:mt-4">

          {/* Header Title with Light Accent Line */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[35px] font-semibold tracking-tight text-[#67e8f9] leading-none">
              Travel Tech
            </h1>
            <h1 className="text-2xl sm:text-3xl lg:text-[35px] font-semibold tracking-tight text-[#67e8f9] leading-tight pb-3">
              Services LLP.
            </h1>
            <div className="h-1 w-24 bg-[#38bdf8] rounded-full mt-1" />
          </div>

          {/* Subheading & Core Value Prop */}
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-normal text-white leading-snug">
              Every refund, calculated automatically.
            </h2>
            <p className="text-xs sm:text-xs lg:text-[12px] text-blue-100/90 leading-relaxed font-normal max-w-md">
              Reads GDS and LCC ticket data, applies fare rules, and produces a precise refund calculation &mdash; no manual rework, even on the most complex fares.
            </p>
          </div>

          {/* Automation Capabilities List */}
          <div className="space-y-3.5 pt-0">
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              Automation Capabilities
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Capability 1 */}
              <div>
                <h4 className="font-semibold text-[#FFE8A3E5]">
                  1. Precise on complex fares
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-4">
                  Multi-sector and penalty-heavy fares get the same accuracy as simple ones.
                </p>
              </div>

              {/* Capability 2 */}
              <div>
                <h4 className="font-semibold text-[#FFE8A3E5]">
                  2. Native GDS and LCC coverage
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-4">
                  Ticket data is read directly from source, with no manual re-entry.
                </p>
              </div>

              {/* Capability 3 */}
              <div>
                <h4 className="font-semibold text-[#FFE8A3E5]">
                  3. Zero manual steps, request to disbursal
                </h4>
                <p className="text-blue-100/80 text-xs mt-0.5 font-normal pl-4">
                  One validated pipeline carries every case through to payout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE: Clean Sign In Card & Logo Container */}
      {/* ========================================== */}
      <div className="flex-1 bg-[#f8fafc] p-4 sm:p-8  flex flex-col items-center justify-between min-h-screen overflow-y-auto">

        {/* Top Official TTS Logo Header (Supports provided logo image or fallback SVG) */}
        <div className="pt-2 pb-4 flex flex-col items-center">
          {ttsLogoUrl ? (
            <img
              src={ttsLogoUrl}
              alt="Travel Tech Services (TTS)"
              className="h-18 w-auto object-contain mix-blend-multiply"
            />
          ) : (
            <div className="flex items-center gap-3">
              {/* Globe Icon SVG */}
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#3456A7] flex items-center justify-center text-[#3456A7]">
                  <Globe className="w-8 h-8 text-[#3456A7]" />
                </div>
                {/* Orbiting Plane */}
                <div className="absolute inset-0 flex items-center justify-center transform rotate-12">
                  <div className="w-14 h-5 border-t-2 border-[#3456A7] rounded-full" />
                </div>
              </div>

              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-[#3456A7] leading-none">
                  TTS
                </span>
                <span className="text-[10px] font-black text-[#3456A7] uppercase tracking-wider mt-0.5">
                  RECOVER EVERY PENNY
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Centered Royal Blue Sign-In Card (#3456A7) */}
        <div className="w-full max-w-sm  bg-[#3456A7] rounded-2xl p-6 sm:p-8 shadow-2xl text-white my-auto border border-blue-400/20">

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase">
              WELCOME
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 font-normal">
              Please enter your login details
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email / Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Email ID/Username
              </label>
              <Input
                type="email"
                placeholder="Enter email or username"
                {...register("email")}
                className="h-8 w-full rounded-md bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3 shadow-inner placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Password
              </label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                  className="h-8 w-full rounded-md bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3 pr-10 shadow-inner placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[#FFE8A3] text-xs mt-0.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forget Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-white font-medium">
                Remember Me
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded bg-white text-blue-600 focus:ring-[#FFE8A3] cursor-pointer accent-[#FFE8A3]"
                />
              </label>

              <Link
                to="/forgot-password"
                className="text-white hover:text-[#FFE8A3] transition-colors font-medium hover:underline"
              >
                Forget Password?
              </Link>
            </div>

            {/* Bright Yellow Sign In Button (#FFE8A3) */}
            <CustomButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full h-10.5 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-md transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-3 cursor-pointer border-none"
            >
              Sign In
            </CustomButton>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-blue-300/30 w-full" />
              <span className="bg-[#3456A7] px-3 text-[11px] text-blue-100 font-normal shrink-0">
                or sign in with
              </span>
              <div className="border-t border-blue-300/30 w-full" />
            </div>

            {/* Microsoft Outlook Social Button */}
            <button
              type="button"
              onClick={() => toast.info("Microsoft Outlook sign-in initialized.")}
              className="w-full h-9.5 bg-[#25438c] hover:bg-[#1d3778] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2.5 border border-blue-300/30 shadow-sm transition-all cursor-pointer"
            >
              {/* Microsoft Outlook Icon SVG */}
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
              </svg>
              Microsoft Outlook
            </button>
          </form>
        </div>

        {/* Footer Subtext Below Card */}
        <div className="text-center text-[11px] text-slate-500 font-normal max-w-xs sm:max-w-sm mt-4 mb-2 leading-relaxed">
          Backed by travel professionals with 100+ combined years leading top European and Indian airlines.
        </div>
      </div>
    </div>
  );
};

export default Login;