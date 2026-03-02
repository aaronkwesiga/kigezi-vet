import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-red-600/10 blur-[150px] pointer-events-none" />

      <div className="text-center relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-red-600 shadow-[0_0_50px_rgba(255,0,0,0.5)] border-b-8 border-red-800">
          <AlertTriangle className="h-16 w-16 text-white" />
        </div>

        <h1 className="mb-6 font-display text-9xl font-black text-white tracking-widest leading-none drop-shadow-[0_15px_15px_rgba(0,0,0,1)] uppercase">
          4<span className="text-red-600">0</span>4
        </h1>

        <div className="mx-auto h-2 w-48 bg-red-600 rounded-full mb-10 shadow-[0_0_20px_rgba(255,0,0,0.8)]" />

        <p className="mb-20 text-4xl font-black text-white/50 uppercase tracking-tighter leading-none">
          Signal Interrupted: <span className="text-white">Route Not Found</span>
        </p>

        <Link to="/">
          <Button size="lg" className="h-32 px-16 gap-6 rounded-[3rem] bg-green-600 hover:bg-green-500 text-white font-black text-4xl uppercase tracking-[0.3em] shadow-[0_30px_80px_rgba(34,197,94,0.4)] transition-all border-b-[20px] border-green-800 hover:scale-105 active:scale-95">
            <Zap className="h-10 w-10 fill-white" /> Recover Path
          </Button>
        </Link>

        <p className="mt-20 text-xs font-black uppercase tracking-[0.5em] text-white/10">
          Kigezi Vet Diagnostic Terminal • Error Code: VOID_ROUTING
        </p>
      </div>
    </div>
  );
};

export default NotFound;
