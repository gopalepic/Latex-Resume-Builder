// pages/github-callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function GitHubCallback() {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const code = router.query.code;

      if (!code) return;

      try {
        const response = await axios.post("http://localhost:4000/api/auth/github", {
          code,
        });

        const token = response.data.token;

        if (token) {
          localStorage.setItem("token", token);
          router.push("/dashboard"); // or wherever you want to redirect after login
        } else {
          console.error("Token not received");
        }
      } catch (error) {
        console.error("GitHub login failed", error);
      }
    };

    fetchToken();
  }, [router.query.code]);

  return <p>Logging in with GitHub...</p>;
}
