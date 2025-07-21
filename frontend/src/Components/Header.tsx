// src/components/Header.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Header() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await axios.get("http://localhost:4000/api/resumes/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserName(res.data.name || "User");
        } catch (err) {
          console.error("Failed to fetch user name:", err);
        }
      }
    };
    fetchUserInfo();
  }, []);

  const logout = async () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="w-full flex justify-end items-center p-4 bg-gray-100 shadow">
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold"
        >
       {userName ? userName[0]?.toUpperCase() : ""}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded-lg py-2 z-10">
            <button
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => router.push("/dashboard/profile")}
            >
              👤 Profile
            </button>
            <button
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => router.push("/dashboard")}
            >
              📄 Your Resumes
            </button>
            <button
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => router.push("/dashboard/settings")}
            >
              ⚙️ Settings
            </button>
            <button
              className="block px-4 py-2 text-red-600 hover:bg-red-100 w-full text-left"
              onClick={logout}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
