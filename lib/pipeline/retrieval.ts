/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
}

function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string | null {
  if (!invertedIndex) return null;
  const words: { word: string; pos: number }[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push({ word, pos });
    }
  }
  words.sort((a, b) => a.pos - b.pos);
  return words.map(w => w.word).join(' ');
}

export async function retrievePapers(query: string, limit = 15): Promise<Paper[]> {
  const baseUrl = process.env.OPENALEX_BASE_URL || 'https://api.openalex.org';
  
  try {
    const url = `${baseUrl}/works?search=${encodeURIComponent(query)}&per-page=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    let results = data.results || [];

    // Fallback if fewer than 5 results
    if (results.length < 5) {
      console.log(`Only found ${results.length} results. Attempting fallback search...`);
      // Fallback: search using a broader query (first 3 words of the original query)
      const words = query.split(/\s+/);
      if (words.length > 3) {
        const fallbackQuery = words.slice(0, 3).join(' ');
        const fallbackUrl = `${baseUrl}/works?search=${encodeURIComponent(fallbackQuery)}&per-page=${limit}`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackResults = fallbackData.results || [];
          
          // Merge results, avoiding duplicates
          const existingIds = new Set(results.map((r: any) => r.id));
          for (const item of fallbackResults) {
            if (!existingIds.has(item.id)) {
              results.push(item);
              existingIds.add(item.id);
            }
          }
          // Trim to the original limit
          results = results.slice(0, limit);
        }
      }
    }

    return results.map((work: any) => ({
      id: work.id,
      title: work.title || 'Untitled',
      abstract: reconstructAbstract(work.abstract_inverted_index),
      authors: work.authorships?.map((a: any) => a.author?.display_name || 'Unknown') || [],
      year: work.publication_year || null,
    }));
  } catch (error) {
    console.error('Error retrieving papers:', error);
    // Return empty array or throw error based on preference, here we return empty or partial array on fail
    return [];
  }
}
