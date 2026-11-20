import { Link } from "react-router-dom";
import React from "react";
import CustomButton from "@/components/common/Buttons/CustomButton";

const Unauthorized = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12">
      <div className="container flex flex-col items-center justify-center gap-6 text-center">
        {/* Large 403 Text */}
        <div className="space-y-2">
          <h1 className="text-9xl font-black tracking-tighter text-muted-foreground/20">
            403
          </h1>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Access Denied
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
            You do not have the required permissions to access this page. Please
            contact your administrator or go back.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <CustomButton size="lg" className="px-8">
            <Link to="/">Go Back Home</Link>
          </CustomButton>

          <CustomButton
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            Previous Page
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
