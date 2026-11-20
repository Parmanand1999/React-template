import { getData, postData, putData } from "./apiServices";

export const loginWithEmail = (data) => postData("/auth/login", data);
export const loginWithMobile = (data) =>
  postData("/auth/login/mobile", data);
export const loginWithotp = (data) => postData("/auth/login/verifyOTP", data);
export const forgotPasswordApi = (data) =>
  postData("/auth/forgot-password", data);
export const resendOtpApi = (data) =>
  postData("/auth/resend-otp", data);
// Two separate reset flows, kept on separate endpoints so their payloads never clash:
// 1. OTP flow (ForgotPassword page): { email, otp, newPassword }
export const resetPasswordApi = (data) =>
  postData("/auth/reset-password", data);
// 2. Email-link flow (ResetPassword page, /reset-password?token=...): { token, newPassword }
export const resetPasswordWithTokenApi = (data) =>
  postData("/auth/reset-password/token", data);
// export const resendVerificationApi = (data) =>
//   postData("/auth/resend-verification-email", data);
// export const signupApi = (data) => postData("/auth/signup", data);
// export const organizationData = () => getData("/organizationType");
// export const updateEmailApi = (data) => postData("/auth/signup", data);
export const verifyEmailApi = (token) =>
  getData(`/auth/verify-email?token=${token}`);
export const getProfileApi = () => getData("/userInfo/get");
export const addProfileApi = (data) => postData("/userInfo/add", data);
export const updateProfileApi = (data) => putData("/userInfo/update", data);
export const uploadFaceIndexApi = (formData) =>
  postData("/uploadFile/faceIndexes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
