import axios from 'axios';

export interface GithubStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  repo: string;
}

const repo = import.meta.env.VITE_GITHUB_REPO as string | undefined;

/**
 * Fetches public repo stats from the GitHub API. Returns null when no repo is
 * configured (VITE_GITHUB_REPO) or the request fails, so the UI can show a
 * "connect your repo" placeholder gracefully.
 */
export const githubService = {
  configuredRepo: repo ?? null,

  async getStats(): Promise<GithubStats | null> {
    if (!repo) return null;
    try {
      const { data } = await axios.get<{
        stargazers_count: number;
        forks_count: number;
        open_issues_count: number;
        subscribers_count: number;
      }>(`https://api.github.com/repos/${repo}`, { timeout: 8000 });
      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        watchers: data.subscribers_count,
        repo,
      };
    } catch {
      return null;
    }
  },
};
