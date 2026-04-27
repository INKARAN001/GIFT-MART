/**
 * Parse JSON from a fetch Response. Empty or non-JSON bodies return `fallback`
 * so callers avoid "Unexpected end of JSON input" from response.json().
 */
export async function jsonFromResponse(res, fallback = null) {
  const text = await res.text();
  if (text == null || text.trim() === '') {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
