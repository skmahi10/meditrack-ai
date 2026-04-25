import { Outfit, IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import ThemeProvider from "@/components/layout/ThemeProvider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "MediTrack AI \u2014 Intelligent Cold-Chain Platform",
  description:
    "Open Intelligent Cold-Chain Supply Chain Platform for Pharmaceutical Logistics. Google Solution Challenge 2026.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6C63FF",
          colorBackground: "#12121A",
          colorInputBackground: "#1A1A2E",
          colorText: "#EAEAF4",
          colorTextSecondary: "#8B8BA7",
          borderRadius: "10px",
          fontFamily: "'IBM Plex Sans', sans-serif",
        },
        elements: {

          elements: {
            card: {
              backgroundColor: "#12121A",
              border: "1px solid rgba(108, 99, 255, 0.12)",
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6)",
            },
            headerTitle: {
              color: "#EAEAF4",
              fontWeight: 600,
            },
            headerSubtitle: {
              color: "#8B8BA7",
            },
            formFieldLabel: {
              color: "#EAEAF4",
            },
            formFieldInput: {
              backgroundColor: "#1A1A2E",
              borderColor: "rgba(108, 99, 255, 0.2)",
              color: "#EAEAF4",
              "&::placeholder": {
                color: "#5A5A72",
              },
            },
            formFieldInputShowPasswordButton: {
              color: "#8B8BA7",
            },
            formButtonPrimary: {
              backgroundColor: "#6C63FF",
              color: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(108, 99, 255, 0.25)",
            },
            footerActionLink: {
              color: "#6C63FF",
            },
            footerActionText: {
              color: "#8B8BA7",
            },
            socialButtonsBlockButton: {
              backgroundColor: "#1A1A2E",
              border: "1px solid rgba(108, 99, 255, 0.15)",
              color: "#EAEAF4",
            },
            socialButtonsBlockButtonText: {
              color: "#EAEAF4",
            },
            dividerLine: {
              backgroundColor: "rgba(255, 255, 255, 0.06)",
            },
            dividerText: {
              color: "#5A5A72",
            },
            identityPreviewEditButton: {
              color: "#6C63FF",
            },
            formResendCodeLink: {
              color: "#6C63FF",
            },
            otpCodeFieldInput: {
              backgroundColor: "#1A1A2E",
              borderColor: "rgba(108, 99, 255, 0.2)",
              color: "#EAEAF4",
            },
            userButtonPopoverCard: {
              backgroundColor: "#12121A",
              border: "1px solid rgba(108, 99, 255, 0.12)",
            },
            userButtonPopoverMain: {
              backgroundColor: "#12121A",
            },
            userButtonPopoverActionButton: {
              color: "#EAEAF4",
            },
            userButtonPopoverActionButtonText: {
              color: "#EAEAF4",
            },
            userButtonPopoverActionButtonIcon: {
              color: "#8B8BA7",
            },
            userButtonPopoverFooter: {
              display: "none",
            },
            userPreviewMainIdentifier: {
              color: "#EAEAF4",
            },
            userPreviewSecondaryIdentifier: {
              color: "#8B8BA7",
            },
            modalContent: {
              backgroundColor: "#12121A",
            },
            modalCloseButton: {
              color: "#8B8BA7",
            },
            profileSectionTitle: {
              color: "#EAEAF4",
            },
            profileSectionContent: {
              color: "#8B8BA7",
            },
            formFieldLabelRow: {
              color: "#EAEAF4",
            },
            formFieldHintText: {
              color: "#5A5A72",
            },
            alertText: {
              color: "#EAEAF4",
            },
            badge: {
              color: "#EAEAF4",
              backgroundColor: "#1A1A2E",
            },
          },
        },
      }}
    >
      <html lang="en" className={`${outfit.variable} ${ibmPlex.variable}`}>
        <body>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}