import LoadingCircle from "@/components/LoadingCircle";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#252525] flex items-center justify-center">
      <LoadingCircle />
    </div>
  );
}
