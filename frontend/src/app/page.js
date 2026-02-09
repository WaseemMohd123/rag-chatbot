"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      // If logged in, redirect directly to chatbot
      const parsed = JSON.parse(user);
      setLoggedInUser(parsed);
      console.log("User is logged in:", parsed);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 via-black to-purple-900 animate-gradient">
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>

      <div className="bg-gray-900 p-12 rounded-3xl shadow-2xl max-w-xl w-full text-center border border-purple-700">
        <h1 className="text-5xl font-extrabold text-purple-400 mb-6 drop-shadow-lg animate-pulse">
          Welcome to ChatBot AI
        </h1>
        <p className="text-gray-300 mb-10 text-lg">
          Your intelligent assistant built with{" "}
          <span className="text-purple-400 font-semibold">LangChain</span>,{" "}
          <span className="text-purple-400 font-semibold">FastAPI</span> &{" "}
          <span className="text-purple-400 font-semibold">Next.js</span>
        </p>

        <div className="flex justify-center space-x-6 mb-6">
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg transition transform hover:scale-105"
          >
            Register
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-xl border border-purple-500 text-purple-400 hover:bg-purple-800 font-semibold shadow-lg transition transform hover:scale-105"
          >
            Login
          </button>
        </div>
        {loggedInUser && (
          <p className="text-gray-500 mt-6 text-sm">
            Already logged in?{" "}
            <span
              onClick={() => router.push(`/ask/${loggedInUser.username}`)}
              className="text-purple-400 cursor-pointer hover:underline hover:text-purple-300"
            >
              Go to Chatbot
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
