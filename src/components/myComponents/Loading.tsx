const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgba(255,255,255,0.85)] dark:bg-[#0A0A0A]">
      <div className="relative">
        <div className="w-20 h-20 border-[#b1f128]/70 border-2 rounded-full" />
        <div className="w-20 h-20 border-[#b1f128] border-t-2 animate-spin rounded-full absolute left-0 top-0" />
        <div className="sr-only">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
