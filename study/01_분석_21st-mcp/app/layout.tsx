export const metadata = {
  title: "Glass Folder Cards — 21st.dev MCP Integration",
  description: "Glass folder component with frosted glass UI, built with shadcn/ui + Tailwind CSS",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
