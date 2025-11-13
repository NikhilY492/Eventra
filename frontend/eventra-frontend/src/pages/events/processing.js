import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate payment processing delay (e.g., 4 seconds)
    const timer = setTimeout(() => {
      router.push("/events/success");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-sm">
        <div className="animate-spin mx-auto mb-4 border-4 border-gray-300 border-t-gray-800 rounded-full h-10 w-10"></div>
        <h2 className="text-lg font-semibold text-gray-800">Processing Payment</h2>
        <p className="text-sm text-gray-500 mt-2">Please don't close this window...</p>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-6 overflow-hidden">
          <div className="bg-gray-800 h-full animate-[loading_4s_linear_forwards]"></div>
        </div>

        <style jsx>{`
          @keyframes loading {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
