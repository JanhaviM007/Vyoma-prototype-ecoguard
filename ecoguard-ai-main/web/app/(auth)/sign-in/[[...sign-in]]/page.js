import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-sm normal-case',
            card: 'shadow-xl border border-slate-200 rounded-3xl'
          }
        }}
      />
    </div>
  );
}