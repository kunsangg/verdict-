import { getModelResponse } from '../providers';
import { Claim } from './extractClaims';

export interface StressTestResult {
  noveltySignal: number;
  closestExistingWork: string[];
  evidenceSupport: number;
  supportingEvidence: string[];
  contradictionRisk: number;
  conflictingEvidence: string[];
  unsupportedAssumptions: string[];
  missingEvidence: string;
  recommendedExperiment: string;
}

export async function stressTestHypothesis(
  hypothesis: string, 
  claims: Claim[], 
  retries = 1
): Promise<StressTestResult> {
  const prompt = `
You are an expert scientific reviewer. You will be provided with a proposed research hypothesis and a set of claims extracted from existing academic literature.
Your task is to critically analyze the hypothesis against the provided literature claims and evaluate its novelty, evidence support, and potential risks.

Please output your analysis as a single JSON object matching EXACTLY this structure. Do not include markdown formatting, backticks, or conversational text.
{
  "noveltySignal": <number 0 to 1, where 1 is highly novel and 0 is heavily overlapping with existing work>,
  "closestExistingWork": [<array of strings: claims or paper IDs representing the closest existing work>],
  "evidenceSupport": <number 0 to 1, representing how strongly existing claims support the hypothesis>,
  "supportingEvidence": [<array of strings: claims or paper IDs that support the hypothesis>],
  "contradictionRisk": <number 0 to 1, representing the risk that existing work contradicts the hypothesis>,
  "conflictingEvidence": [<array of strings: claims or paper IDs that conflict with the hypothesis>],
  "unsupportedAssumptions": [<array of strings: implicit assumptions in the hypothesis not backed by the literature>],
  "missingEvidence": "<string: what key evidence is completely missing from the literature to prove this hypothesis>",
  "recommendedExperiment": "<string: a concise experiment design to adequately test the hypothesis>"
}

Hypothesis: "${hypothesis}"

Literature Claims:
${JSON.stringify(claims, null, 2)}
`;

  try {
    const response = await getModelResponse(prompt, { temperature: 0.2, maxTokens: 2500 });
    const cleanedResponse = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedResponse);

    // Validate the response shape robustly
    if (
      typeof parsed.noveltySignal !== 'number' ||
      !Array.isArray(parsed.closestExistingWork) ||
      typeof parsed.evidenceSupport !== 'number' ||
      !Array.isArray(parsed.supportingEvidence) ||
      typeof parsed.contradictionRisk !== 'number' ||
      !Array.isArray(parsed.conflictingEvidence) ||
      !Array.isArray(parsed.unsupportedAssumptions) ||
      typeof parsed.missingEvidence !== 'string' ||
      typeof parsed.recommendedExperiment !== 'string'
    ) {
      throw new Error("Model response JSON missing or malformed required fields.");
    }

    return parsed as StressTestResult;
  } catch (error) {
    if (retries > 0) {
      console.warn("Malformed output or error from model during stress test. Retrying...");
      return stressTestHypothesis(hypothesis, claims, retries - 1);
    }
    throw new Error("Failed to generate a valid stress test result after retries: " + (error instanceof Error ? error.message : String(error)));
  }
}
