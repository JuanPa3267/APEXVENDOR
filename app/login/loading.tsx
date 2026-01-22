import LoadingCircle from "@/components/LoadingCircle";

export default function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#f8f9fa]">
      <LoadingCircle />
    </div>
  );
}
