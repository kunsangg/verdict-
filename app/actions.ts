'use server';

import { retrievePapers, extractClaims, stressTestHypothesis, Claim } from '@/lib/pipeline';

export async function analyzeQuestionAction(question: string) {
  try {
    const papers = await retrievePapers(question);
    const claims = await extractClaims(papers);
    return { success: true, papers, claims };
  } catch (error) {
    console.error("Analysis failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function stressTestAction(hypothesis: string, claims: Claim[]) {
  try {
    const result = await stressTestHypothesis(hypothesis, claims);
    return { success: true, result };
  } catch (error) {
    console.error("Stress test failed:", error);
    return { success: false, error: String(error) };
  }
}
