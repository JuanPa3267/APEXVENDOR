import LoadingCircle from "@/components/LoadingCircle";

export default function DashboardLoading() {
  return (
    <div className="flex-1 bg-[#fafae6] flex items-center justify-center p-8">
      <LoadingCircle />
    </div>
  );
}
