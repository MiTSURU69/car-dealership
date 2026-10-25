interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page: string } };
}

export interface CarSpecs {
  title: string;
  extract: string;
  imageUrl: string | null;
  wikiUrl: string | null;
}

/** Fetches the Wikipedia summary for "<make> <model>". Returns null on any failure. */
export async function fetchCarSpecs(make: string, model: string): Promise<CarSpecs | null> {
  const title = `${make} ${model}`.trim().replace(/\s+/g, '_');
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'ApexMotorHouse/1.0 (learning project)',
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return null;
    const data: WikiSummary = await res.json();
    if (data.extract?.toLowerCase().includes('may refer to')) return null; // disambiguation
    return {
      title: data.title,
      extract: data.extract ?? '',
      imageUrl: data.thumbnail?.source ?? null,
      wikiUrl: data.content_urls?.desktop?.page ?? null,
    };
  } catch {
    return null;
  }
}