import LoadingCircle from "@/components/LoadingCircle";

export default function RegisterLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4 bg-[#fafae6]">
      <LoadingCircle />
    </div>
  );
}
