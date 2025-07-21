import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import z from "zod";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle GitHub OAuth callback - receive token from backend redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } else if (error) {
      setError(`GitHub login failed: ${error}`);
    }
  }, []);

  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=http://localhost:4000/api/auth/github/callback&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
  };

  const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue?.message || "Invalid input");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        { email: formData.email, password: formData.password }
      );

      const { token } = response.data;
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Login Failed . Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
        <div className="mt-6 border-t pt-4 text-center">
          <p className="mb-2 text-gray-600">or</p>

          {/* ✅ GitHub OAuth Button */}
          <button
            type="button"
            onClick={handleGitHubLogin}
            className="w-full bg-gray-900 text-white p-2 rounded hover:bg-black"
          >
            Sign in with GitHub 🐱
          </button>
        </div>
      </div>
    </div>
  );
}
