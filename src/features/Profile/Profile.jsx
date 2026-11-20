import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    UserRound,
    UserPen,
    Check,
    RotateCcw,
    Camera,
    Heart,
    Shield,
    ChevronRight,
    Loader2,
} from "lucide-react";
import {
    getProfileApi,
    addProfileApi,
    updateProfileApi,
    uploadFaceIndexApi,
} from "@/Services/authService";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "react-toastify";

const nameRegex = /^[a-zA-Z\s]+$/;

// Zod Validation Schema
const profileSchema = z.object({
    firstName: z.string()
        .min(1, "First name is required")
        .regex(nameRegex, "First name must contain only letters"),
    lastName: z.string()
        .min(1, "Last name is required")
        .regex(nameRegex, "Last name must contain only letters"),
    bloodGroup: z.string().min(1, "Blood group is required"),
    email: z.string().email("Invalid email address").or(z.literal("")),
    dob: z.string()
        .min(1, "Date of birth is required")
        .refine((val) => {
            const birthDate = new Date(val);
            const today = new Date();
            return birthDate <= today;
        }, { message: "Date of birth cannot be in the future" }),
    gender: z.enum(["Male", "Female", "Other"], {
        errorMap: () => ({ message: "Gender is required" }),
    }),
});

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("/avatars/placeholder.jpg");
    const fileInputRef = useRef(null);

    const userData = useAuthStore((state) => state.user);

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            bloodGroup: "",
            email: "",
            dob: "",
            gender: "Male",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = form;

    const currentGender = watch("gender");
    const formValues = watch();

    // Fetch Profile details from API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getProfileApi();
            if (res?.status === 200 && res.data?.data) {
                // Handle cases where data is an array or object
                const profileData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                console.log(profileData, "Profile Data");

                if (profileData) {
                    setProfileId(profileData._id || null);
                    setValuesFromSource(profileData);
                } else {
                    setValuesFromDefault();
                }
            } else {
                setValuesFromDefault();
            }
        } catch (error) {
            console.warn("API profile fetch failed:", error);
            setValuesFromDefault();
        } finally {
            setLoading(false);
        }
    };

    // Load profile data on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Helper to map values from API response
    const setValuesFromSource = (data) => {
        reset({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bloodGroup: data.bloodGroup || "",
            email: data.email || "",
            dob: data.dob ? data.dob.split("T")[0] : "",
            gender: data.gender || "Male",
        });
        if (data.profilePhoto && data.profilePhoto.length > 0) {
            setAvatarUrl(data.profilePhoto[0]);
        } else {
            setAvatarUrl("/avatars/placeholder.jpg");
        }
    };

    // Set default values based on logged-in user state
    const setValuesFromDefault = () => {
        reset({
            firstName: "",
            lastName: "",
            bloodGroup: "",
            email: "",
            dob: "",
            gender: "Male",
        });
        setAvatarUrl("/avatars/placeholder.jpg");
        setProfileId(null);
    };

    // Handle Form Submission (Save Profile)
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                bloodGroup: data.bloodGroup,
                profilePhoto: avatarUrl !== "/avatars/placeholder.jpg" ? [avatarUrl] : [],
                email: data.email,
                dob: data.dob,
                gender: data.gender,
            };

            let saveResponse;
            if (profileId) {
                // UPDATE Existing Profile (PUT)
                payload._id = profileId;
                saveResponse = await updateProfileApi(payload);
            } else {
                // ADD New Profile (POST)
                saveResponse = await addProfileApi(payload);
            }

            // If response returns the newly created/updated profile object, update state ID
            const savedData = saveResponse?.data?.data;
            if (savedData?._id) {
                setProfileId(savedData._id);
            }

            // Sync authStore user details display
            useAuthStore.getState().login({
                ...useAuthStore.getState(),
                userDetails: {
                    ...userData,
                    name: `${data.firstName} ${data.lastName}`.trim() || userData?.contactNumber,
                }
            });

            toast.success("Profile saved successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to save profile details.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger avatar image upload
    const handlePhotoClick = () => {
        if (isEditing && !uploadingImage) {
            fileInputRef.current?.click();
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];

        if (file) {
            const FIVE_MB = 5 * 1024 * 1024;
            if (file.size > FIVE_MB) {
                toast.error("Image size must be less than 5MB.");
                e.target.value = "";
                return;
            }

            try {
                setUploadingImage(true);
                const formData = new FormData();
                formData.append("file", file);
                formData.append("userType", "user")
                const res = await uploadFaceIndexApi(formData);
                const uploadedUrl = res.data?.filePath || res.data?.data?.filePath

                if (uploadedUrl) {
                    setAvatarUrl(uploadedUrl);
                    toast.success("Image uploaded successfully!");
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to upload profile image.");
            } finally {
                setUploadingImage(false);
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4">
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                    <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-primary" /> General Info
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Your basic identity and profile details</p>
                </div>

                {/* Edit Action Triggers */}
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer"
                        >
                            <UserPen className="h-3.5 w-3.5" /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchProfile();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Cancel
                            </button>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs cursor-pointer"
                                disabled={loading || uploadingImage}
                            >
                                <Check className="h-3.5 w-3.5" /> Save
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start mt-1">
                {/* LEFT PANEL: Profile Summary Card */}
                <div className="lg:col-span-1 bg-white border border-slate-200/85 rounded-xl p-4 shadow-xs flex flex-col items-center text-center gap-4">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                        <Avatar className={`h-20 w-20 border-2 border-accent shadow-xs relative ${isEditing ? "hover:opacity-85 transition-opacity" : ""}`}>
                            <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
                            <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-black">
                                {formValues.firstName ? formValues.firstName[0]?.toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>

                        {/* Image uploading overlay state */}
                        {uploadingImage && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                        )}

                        {isEditing && !uploadingImage && (
                            <div className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground p-1.5 rounded-full shadow-xs border border-background hover:scale-105 transition-all">
                                <Camera className="h-3.5 w-3.5" />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="space-y-0.5 w-full">
                        <h3 className="text-base font-bold text-foreground truncate">
                            {formValues.firstName || formValues.lastName
                                ? `${formValues.firstName} ${formValues.lastName}`.trim()
                                : "Admin Profile"}
                        </h3>
                        <div className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary/20 uppercase tracking-wide">
                            {userData?.roleName || "Admin"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{userData?.contactNumber || "No Mobile Number"}</p>
                    </div>

                    {/* ICE Card Custom Badge Visual */}
                    <div className="w-full border-t border-border pt-3 mt-1 space-y-2.5">
                        <div className="bg-muted/50 rounded-lg p-2.5 border border-border flex items-center justify-between text-left text-xs">
                            <div className="flex items-center gap-2">
                                <div className="bg-accent text-accent-foreground p-1.5 rounded-md">
                                    <Heart className="h-3.5 w-3.5 fill-current" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">ICE Profile Card</h4>
                                    <p className="text-[9px] text-slate-500">Emergency Details Sync</p>
                                </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </div>

                        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between text-left text-xs">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-md">
                                    <Shield className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">System Permissions</h4>
                                    <p className="text-[9px] text-slate-500">Verified admin accounts</p>
                                </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Dynamic Form Fields */}
                <div className="lg:col-span-2 bg-white border border-slate-200/85 rounded-xl p-4 md:p-5 shadow-xs">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Name */}
                            {/* First Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    First name <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    readOnly={!isEditing || loading}
                                    placeholder="Enter First Name"
                                    {...register("firstName")}
                                    className={`border-slate-200 transition-colors ${isEditing
                                        ? "focus-visible:ring-primary/20 focus-visible:border-primary"
                                        : "bg-slate-50/40 text-slate-700 cursor-not-allowed focus-visible:ring-0 focus-visible:border-slate-200"
                                        }`}
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.firstName.message}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    Last name <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    readOnly={!isEditing || loading}
                                    placeholder="Enter Last Name"
                                    {...register("lastName")}
                                    className={`border-slate-200 transition-colors ${isEditing
                                        ? "focus-visible:ring-primary/20 focus-visible:border-primary"
                                        : "bg-slate-50/40 text-slate-700 cursor-not-allowed focus-visible:ring-0 focus-visible:border-slate-200"
                                        }`}
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.lastName.message}</p>
                                )}
                            </div>

                            {/* Blood Group */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    Blood Group <span className="text-destructive">*</span>
                                </label>
                                <div className={!isEditing || loading ? "pointer-events-none cursor-not-allowed" : ""}>
                                    <select
                                        {...register("bloodGroup")}
                                        className={`w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ${isEditing
                                            ? "focus-visible:ring-primary/20 focus-visible:border-primary"
                                            : "bg-slate-50/40 text-slate-700"
                                            }`}
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                {errors.bloodGroup && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.bloodGroup.message}</p>
                                )}
                            </div>

                            {/* Date of birth */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    Date of birth <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    type="date"
                                    readOnly={!isEditing || loading}
                                    {...register("dob")}
                                    className={`border-slate-200 transition-colors ${isEditing
                                        ? "focus-visible:ring-primary/20 focus-visible:border-primary"
                                        : "bg-slate-50/40 text-slate-700 cursor-not-allowed focus-visible:ring-0 focus-visible:border-slate-200"
                                        }`}
                                />
                                {errors.dob && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.dob.message}</p>
                                )}
                            </div>

                            {/* Gender radio buttons layout matching app */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Gender
                                </label>
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    {["Male", "Female", "Other"].map((gen) => {
                                        const isSelected = currentGender === gen;
                                        return (
                                            <label
                                                key={gen}
                                                className={`flex items-center gap-2 px-4 py-2 border text-xs font-semibold transition-all select-none cursor-pointer rounded-lg ${!isEditing
                                                    ? isSelected
                                                        ? "bg-slate-100 border-slate-200 text-slate-800 pointer-events-none"
                                                        : "border-slate-100 text-slate-400 pointer-events-none"
                                                    : isSelected
                                                        ? "bg-accent border-primary text-primary"
                                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={gen}
                                                    {...register("gender")}
                                                    className="hidden"
                                                />
                                                <span
                                                    className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                                                        ? "border-primary"
                                                        : "border-slate-300"
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    )}
                                                </span>
                                                {gen}
                                            </label>
                                        );
                                    })}
                                </div>
                                {errors.gender && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.gender.message}</p>
                                )}
                            </div>

                            {/* Email id */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    Email id
                                </label>
                                <Input
                                    type="email"
                                    readOnly={!isEditing || loading}
                                    placeholder="shristi@gmail.com"
                                    {...register("email")}
                                    className={`border-slate-200 transition-colors ${isEditing
                                        ? "focus-visible:ring-primary/20 focus-visible:border-primary"
                                        : "bg-slate-50/40 text-slate-700 cursor-not-allowed focus-visible:ring-0 focus-visible:border-slate-200"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-medium">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone number (Read-only System Identity Field) */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                                    Phone number
                                </label>
                                <Input
                                    type="tel"
                                    disabled={true}
                                    value={userData?.contactNumber || ""}
                                    className="border-slate-200 bg-slate-50/60 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;