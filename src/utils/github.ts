/**
 * Validates owner/repo format
 */
function validateRepoFormat(repoString: unknown): boolean {
  if (typeof repoString !== 'string' || repoString.length === 0) {
    return false
  }

  const parts = repoString.split('/')
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
}

/**
 * Constructs GitHub tarball URL
 */
function getTarballUrl(owner: string, repo: string, branch = 'main'): string {
  return `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.tar.gz`
}

/**
 * Parses a repository string to an object.
 *
 * The repository string should be in the format 'owner/repo'. If the string is invalid, an error is thrown.
 *
 * @param repoString The repository string to parse.
 * @returns An object with 'owner' and 'repo' properties.
 */
function parseRepo(repoString: string): { owner: string, repo: string } {
  if (!validateRepoFormat(repoString)) {
    throw new Error('Formato de repositorio inválido. Use: owner/repo')
  }

  const [owner, repo] = repoString.split('/')
  return { owner, repo }
}

export {
  validateRepoFormat,
  getTarballUrl,
  parseRepo,
}
