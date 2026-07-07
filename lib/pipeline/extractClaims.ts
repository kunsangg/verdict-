import { getModelResponse } from '../providers';
import { Paper } from './retrieval';

export interface Claim {
  claim: string;
  paper_id: string;
  claim_type: "empirical" | "theoretical";
  confidence: number;
}

const BATCH_SIZE = 3; // Number of papers to process in a single model call

async function extractFromBatch(batch: Paper[], retries = 1): Promise<Claim[]> {
  const papersData = batch.map(p => ({
    id: p.id,
    title: p.title,
    abstract: p.abstract || "No abstract available.",
  }));

  const prompt = `
You are a research assistant tasked with extracting the single most important scientific claim from academic papers.
For each of the following papers, extract the main claim.
Return your answer ONLY as a JSON array of objects. Do not include markdown formatting, backticks, or any conversational text.
Each object must have the following keys:
- "claim": string, the main claim of the paper
- "paper_id": string, the exact ID provided for the paper
- "claim_type": "empirical" | "theoretical"
- "confidence": number, your confidence in the extraction (0 to 1)

Papers:
${JSON.stringify(papersData, null, 2)}
`;

  try {
    const response = await getModelResponse(prompt, { temperature: 0.1, maxTokens: 1500 });
    
    // Clean up potential markdown formatting if the model included it despite instructions
    const cleanedResponse = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Validate output structure
    if (!Array.isArray(parsed)) {
      throw new Error("Model response is not a JSON array.");
    }
    
    const validClaims: Claim[] = parsed.filter(item => 
      item.claim && typeof item.claim === 'string' &&
      item.paper_id && typeof item.paper_id === 'string' &&
      (item.claim_type === 'empirical' || item.claim_type === 'theoretical') &&
      typeof item.confidence === 'number'
    );

    return validClaims;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Malformed output or error from model. Retrying batch of ${batch.length} papers...`);
      return extractFromBatch(batch, retries - 1);
    }
    console.error("Failed to parse claims for batch after retries. Skipping batch.", error);
    return [];
  }
}

export async function extractClaims(papers: Paper[]): Promise<Claim[]> {
  const allClaims: Claim[] = [];
  
  // Chunk papers into manageable batches
  const batches: Paper[][] = [];
  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    batches.push(papers.slice(i, i + BATCH_SIZE));
  }

  // Process batches sequentially to be mindful of rate limits
  for (const batch of batches) {
    const batchClaims = await extractFromBatch(batch);
    allClaims.push(...batchClaims);
  }

  return allClaims;
}
