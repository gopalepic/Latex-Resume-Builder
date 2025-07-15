import { signIn } from "next-auth/react";

export default function GitHubLoginButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="bg-gray-800 text-white px-4 py-2 rounded"
    >
      Sign in with GitHub
    </button>
  );
}
