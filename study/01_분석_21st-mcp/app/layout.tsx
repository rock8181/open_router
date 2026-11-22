import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Glass Folder Cards — 21st.dev MCP Integration",
  description: "Glass folder component with frosted glass UI, built with shadcn/ui + Tailwind CSS",
  openGraph: {
    title: "Glass Folder Cards — 21st.dev MCP Integration",
    description: "Glass folder component with frosted glass UI, built with shadcn/ui + Tailwind CSS",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <a id="skip-link" href="#main" className="skip-link">
          본문 콘텐츠로 건너뛰기
        </a>
        {children}
        <style>
          {`
            #skip-link {
              position: absolute;
              left: -10000px;
              top: auto;
              width: 1px;
              height: 1px;
              overflow: hidden;
              z-index: -9999;
              margin: 0;
              padding: 0;
            }
            #skip-link:focus {
              position: static;
              width: auto;
              height: auto;
              overflow: visible;
              z-index: 9999;
              margin: 0.5rem;
              padding: 0.5rem 0.75rem;
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              border-radius: var(--radius);
              font-size: 0.875rem;
              font-weight: 500;
              text-decoration: underline;
              outline: 2px solid hsl(var(--ring));
              outline-offset: 2px;
            }
          `}
        </style>
      </body>
    </html>
  )
}
