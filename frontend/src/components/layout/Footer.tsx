import { SetuLogo } from "@/assets/SetuLogo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="font-display flex items-center gap-2 font-semibold text-neutral-700">
          <SetuLogo className="h-4 w-4 text-brand-500" />
          SohalaSetu
          <span lang="mr" className="font-normal text-neutral-500" style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}>
            (सोहळासेतू)
          </span>
        </div>
        <p>Budget smart. Book better. &copy; {new Date().getFullYear()} SohalaSetu.</p>
      </div>
    </footer>
  );
}
