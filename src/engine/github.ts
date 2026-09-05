import { GitHubMeta } from './types';

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  const clean = input.trim();

  // Pattern: https://github.com/owner/repo or http://...
  const urlMatch = clean.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Pattern: owner/repo
  const slashMatch = clean.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (slashMatch) {
    return { owner: slashMatch[1], repo: slashMatch[2] };
  }

  return null;
}

export async function fetchGitHubRepo(
  input: string,
  token?: string
): Promise<{ meta: GitHubMeta; markdown: string }> {
  const parsed = parseRepoUrl(input);
  if (!parsed) {
    throw new Error('Invalid GitHub repository format. Use "owner/repo" or full URL.');
  }
  const { meta, readme } = await fetchGitHubRepoData(parsed.owner, parsed.repo, token);
  return { meta, markdown: readme };
}

export async function fetchGitHubRepoData(
  owner: string,
  repo: string,
  token?: string
): Promise<{ meta: GitHubMeta; readme: string }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 1. Fetch Repository Metadata
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 403 || repoRes.status === 429) {
      throw new Error(
        'GitHub API rate limit reached (60 requests/hr for unauthenticated users). You can paste your README directly into the editor.'
      );
    }
    if (repoRes.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
    }
    throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
  }
  const repoJson = await repoRes.json();

  const meta: GitHubMeta = {
    owner: repoJson.owner?.login || owner,
    repo: repoJson.name || repo,
    description: repoJson.description || '',
    stars: repoJson.stargazers_count ?? 0,
    forks: repoJson.forks_count ?? 0,
    openIssues: repoJson.open_issues_count ?? 0,
    watchers: repoJson.subscribers_count ?? repoJson.watchers_count ?? 0,
    license: repoJson.license?.spdx_id || repoJson.license?.name || undefined,
    language: repoJson.language || undefined,
    topics: repoJson.topics || [],
    pushedAt: repoJson.pushed_at
  };

  // 2. Fetch README content
  // First try raw.githubusercontent.com for full verbatim markdown
  let readme = '';
  const branches = ['main', 'master', 'HEAD'];
  for (const b of branches) {
    try {
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${b}/README.md`
      );
      if (rawRes.ok) {
        readme = await rawRes.text();
        if (readme.trim()) break;
      }
    } catch {
      // try next
    }
  }

  // Fallback to GitHub API readme endpoint
  if (!readme) {
    try {
      const rmRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (rmRes.ok) {
        const rmJson = await rmRes.json();
        if (rmJson.content && rmJson.encoding === 'base64') {
          // Decode utf8 base64
          const binary = atob(rmJson.content.replace(/\s/g, ''));
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          readme = new TextDecoder('utf-8').decode(bytes);
        }
      }
    } catch {
      // fallback
    }
  }

  if (!readme) {
    // Basic fallback readme with repo title and description
    readme = `# ${meta.repo}\n\n${meta.description}\n\n## Features\n- Modern architecture\n- Easy integration\n- High performance\n\n## Tech Stack\n- ${meta.language || 'JavaScript'}\n`;
  }

  return { meta, readme };
}
