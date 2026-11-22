import GlassFolder from "@/components/ui/glass-folder-cards"

export default function Page() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <h1 className="mt-4 mb-10 text-center text-xl font-semibold tracking-tight text-foreground">
        유리 폴더 카드
      </h1>
      <p className="relative mt-1 mb-14 text-base text-center text-muted-foreground">
        호버하면 폴더가 기울고, 클릭하면 열리며, + 키로 파일을 추가할 수 있어요
      </p>
      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-14 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        <GlassFolder
          label="나의 파일"
          art="aurora"
          seed={3}
          appear={false}
        />
        <GlassFolder
          label="보관함"
          art="none"
          action="more"
          labelPlacement="top-left"
          files={[
            { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
            { name: "Invoices", meta: "12 PDFs" },
            { name: "Shoot — Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
            { name: "Contract.pdf", meta: "PDF · 320 KB" },
          ]}
          menu={[
            { label: "Rename" },
            { label: "Share…" },
            { label: "Move to Trash", danger: true },
          ]}
        />
        <GlassFolder
          label="개인 문서"
          meta="Wed 19 Aug"
          tone="dark"
          art="ember"
          seed={11}
          action="none"
          labelPlacement="top-right"
          files={[
            { name: "Stills", meta: "64 images", art: "verdant" },
            { name: "Edit notes", meta: "TXT · 4 KB" },
            { name: "Grade v3", meta: "DRX · 18 MB", art: "aurora" },
          ]}
        />
      </div>
    </main>
  )
}
