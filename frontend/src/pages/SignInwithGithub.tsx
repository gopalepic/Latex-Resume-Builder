// SignInWithGithub.tsx
export default function GitHubLoginButton() {
  const handleGitHubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
    const redirectUri = "http://localhost:3000/github-callback";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;

    window.location.href = githubAuthUrl;
  };

  return (
    <button
      onClick={handleGitHubLogin}
      className="bg-gray-800 text-white px-4 py-2 rounded"
    >
      Sign in with GitHub
    </button>
  );
}
