import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "LUXE";

export const metadata: Metadata = {
  title: {
    default: STORE_NAME,
    template: `%s | ${STORE_NAME}`,
  },
  description: "Curated luxury goods, delivered.",
  openGraph: {
    type: "website",
    siteName: STORE_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0A0A0A",
              color: "#FAFAF8",
              borderRadius: 0,
              fontSize: "13px",
              letterSpacing: "0.5px",
            },
          }}
        />
      </body>
    </html>
  );
}
