export function Footer() {
  return (
    <footer className="w-full py-8 text-center bg-white/85 backdrop-blur-md border-t-[1px] border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm text-slate-500">
        <div>
           Curated by <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Amal Ganatra</a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Equity-Wiz.io (React Preview)
        </div>
      </div>
    </footer>
  );
}
