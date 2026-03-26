"use client";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        {/* This component handles everything: Email, Password, and Google */}
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-sm normal-case',
              card: 'shadow-xl border border-slate-200 rounded-3xl'
            }
          }}
          routing="path"
          path="/login" // Match your folder structure
        />
      </div>
    </div>
  );
}