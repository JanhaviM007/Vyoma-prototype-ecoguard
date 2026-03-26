import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { syncUserToDatabase } from "../lib/sync-user";
import { LanguageProvider } from "../context/LanguageContext";


export const metadata = {
  title: "EcoGuard - Citizen Portal",
  description: "Pune Pollution Monitoring System",
};

export default async function RootLayout({ children }) {
  // Ensure a Profile row exists/updates whenever a signed-in user hits the app.
  // (No-op for signed-out visitors.)
  await syncUserToDatabase();

  return (
    <ClerkProvider>
      <LanguageProvider>
        <html lang="en" suppressHydrationWarning>
          <body className="antialiased" suppressContentEditableWarning>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              {children}
            </ThemeProvider>
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}
