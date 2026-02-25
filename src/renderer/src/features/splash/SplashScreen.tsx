export function SplashScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center rounded-2xl bg-[#121212] select-none">
      <img src="/logo.png" alt="Web Automations" className="mb-5 h-20 w-20 rounded-xl" />
      <p className="mb-8 text-lg font-semibold tracking-wide text-white">Web Automations</p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="h-full animate-[splash-progress_1.4s_ease-in-out_infinite] rounded-full bg-white/70" />
      </div>

      <style>{`
        @keyframes splash-progress {
          0%   { transform: translateX(-100%); width: 60%; }
          50%  { transform: translateX(80%);  width: 60%; }
          100% { transform: translateX(200%); width: 60%; }
        }
      `}</style>
    </div>
  )
}
