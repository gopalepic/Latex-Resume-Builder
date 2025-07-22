import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../../Components/Header';

interface Resume {
  id: number;
  name: string;
  email: string;
  area: string;
  city: string;
  country: string;
  phone: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch user data and resumes
        const [userRes, resumesRes] = await Promise.all([
          axios.get("http://localhost:4000/api/resumes/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/resumes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsername(userRes.data.name || "User");
        setResumes(resumesRes.data.resumes || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to fetch data. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="p-6">
      <Header />

      <h1 className="text-2xl font-bold mb-4">📄 Your Resumes</h1>

      {error && <p className="text-red-600">{error}</p>}

      {resumes.length === 0 ? (
        <div className="text-center mt-8">
    <p className="text-gray-500 mb-4">No resumes found. Try creating one!</p>
    <button
      onClick={() => router.push("/resume/choose")}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow transition"
    >
      ➕ Create New Resume
    </button>
  </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="p-4 rounded-xl border shadow bg-white">
              <h2 className="text-xl font-semibold">{resume.name}</h2>
              <p className="text-sm text-gray-600">{resume.email}</p>
              <p className="text-sm text-gray-500">{resume.area}, {resume.city}</p>
              <div className="mt-3 flex justify-between gap-2">
                <button
                  onClick={() => router.push(`/dashboard/view/${resume.id}`)}
                  className="text-sm bg-blue-100 text-blue-800 rounded px-3 py-1"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => router.push(`/dashboard/edit/${resume.id}`)}
                  className="text-sm bg-yellow-100 text-yellow-800 rounded px-3 py-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      await axios.delete(`http://localhost:4000/api/resumes/${resume.id}`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      setResumes(resumes.filter((r) => r.id !== resume.id));
                    } catch (err) {
                      alert("Failed to delete resume");
                    }
                  }}
                  className="text-sm bg-red-100 text-red-800 rounded px-3 py-1"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
