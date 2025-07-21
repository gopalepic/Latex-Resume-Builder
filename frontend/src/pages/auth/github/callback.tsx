import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function GitHubCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const { token, error } = router.query;

    if (token && typeof token === "string") {
      // Store token and redirect to dashboard
      localStorage.setItem("token", token);
      setStatus("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else if (error) {
      setStatus(`GitHub login failed: ${error}`);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [router.query, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">GitHub Authentication</h2>
        <p>{status}</p>
      </div>
    </div>
  );
}
