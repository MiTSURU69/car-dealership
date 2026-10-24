const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const LOOKUP_TIMEOUT_MS = 3000;

interface WikipediaSummary {
  type?: string;
  thumbnail?: { source?: string };
}

/**
 * Looks up a photo for "<make> <model>" on Wikipedia.
 * Best effort: any problem (no page, no image, slow network) returns null,
 * so a failed lookup never stops a vehicle from being saved.
 */
export async function findVehicleImage(make: string, model: string): Promise<string | null> {
  const title = `${make} ${model}`.trim().replace(/\s+/g, '_');

  try {
    const response = await fetch(`${WIKIPEDIA_SUMMARY_URL}${encodeURIComponent(title)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CarDealershipInventory/1.0 (learning project)',
      },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const summary = (await response.json()) as WikipediaSummary;
    if (summary.type === 'disambiguation') return null; // ambiguous title, image would be a guess

    const url = summary.thumbnail?.source;
    return typeof url === 'string' ? url : null;
  } catch {
    return null;
  }
}