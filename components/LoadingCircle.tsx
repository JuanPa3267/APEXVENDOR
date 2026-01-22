"use client";

export default function LoadingCircle() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-[#e9d26a]/10 rounded-full"></div>
        {/* Animated spinner ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-[#e9d26a] rounded-full animate-spin shadow-[0_0_15px_rgba(233,210,106,0.3)]"></div>

        {/* Inner static small dot for techy feel */}
        <div className="absolute inset-[40%] bg-[#e9d26a] rounded-full opacity-20 blur-[2px]"></div>
      </div>
    </div>
  );
}
