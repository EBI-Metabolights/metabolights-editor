const STATIC_PUBLIC_PATH_PATTERNS = [
  /\/datapolicy\/?$/i,
  /\/guides(?:\/.*)?$/i,
];

export function shouldSkipDefaultControlListsForPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  const normalizedPath = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  return STATIC_PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}
