'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeQuestionAction, stressTestAction } from './actions';
import { Paper } from '@/lib/pipeline';
import { Claim } from '@/lib/pipeline/extractClaims';
import { StressTestResult } from '@/lib/pipeline/stressTest';
import { ResultPanel } from '@/components/ResultPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'idle' | 'analyzing' | 'results' | 'stress_testing' | 'final'>('idle');
  const [question, setQuestion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);

  async function handleAnalyze() {
    if (!question.trim()) return;
    setStep('analyzing');
    const res = await analyzeQuestionAction(question);
    if (res.success && res.papers && res.claims) {
      setPapers(res.papers);
      setClaims(res.claims);
      setStep('results');
    } else {
      console.error(res.error);
      alert('Analysis failed: ' + res.error);
      setStep('idle');
    }
  }

  async function handleStressTest() {
    if (!hypothesis.trim()) return;
    setStep('stress_testing');
    const res = await stressTestAction(hypothesis, claims);
    if (res.success && res.result) {
      setStressResult(res.result);
      setStep('final');
    } else {
      console.error(res.error);
      alert('Stress test failed: ' + res.error);
      setStep('results');
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Minimal Header */}
      <header className="w-full max-w-5xl mx-auto py-6 px-4 md:px-8 flex items-center justify-between">
        <div className="font-bold tracking-tight text-xl">Verdict</div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-16 md:pt-24 px-4 md:px-8 w-full max-w-5xl mx-auto">
        
        {step === 'idle' && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
              What are you researching?
            </h1>
            <p className="text-lg text-gray-500">
              Enter a research question to retrieve literature and extract key claims.
            </p>
            <div className="flex w-full items-center space-x-2 mt-8">
              <Input
                type="text"
                placeholder="e.g. How does sleep affect memory consolidation?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-12 text-base shadow-sm focus-visible:ring-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Button onClick={handleAnalyze} className="h-12 px-8 shadow-sm">
                Analyze
              </Button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="w-full max-w-xl text-center space-y-6 py-20 animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium tracking-tight">Analyzing literature</h3>
              <p className="text-gray-500 text-sm">Querying OpenAlex and extracting structural claims...</p>
            </div>
            <div className="space-y-3 pt-8">
              <Skeleton className="h-24 w-full rounded-xl bg-gray-100" />
              <Skeleton className="h-24 w-full rounded-xl bg-gray-100" />
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Literature Found</h2>
              <p className="text-gray-500">Extracted {claims.length} key claims from {papers.length} papers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.slice(0, 4).map((c, i) => (
                <Card key={i} className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {c.claim_type} Claim
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 text-sm leading-relaxed">{c.claim}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mt-12 text-center border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-semibold tracking-tight mb-3">Stress Test a Hypothesis</h3>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                Propose a new hypothesis based on these findings. Verdict will cross-reference it against the extracted claims to evaluate novelty and contradiction risk.
              </p>
              <div className="flex w-full max-w-xl mx-auto items-center space-x-2">
                <Input
                  type="text"
                  placeholder="e.g. REM sleep is the sole driver of spatial memory consolidation."
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="h-12 text-base bg-white shadow-sm focus-visible:ring-gray-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleStressTest()}
                />
                <Button onClick={handleStressTest} className="h-12 px-8 shadow-sm">
                  Stress Test
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'stress_testing' && (
          <div className="w-full max-w-xl text-center space-y-6 py-20 animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium tracking-tight">Stress Testing Hypothesis</h3>
              <p className="text-gray-500 text-sm">Evaluating novelty, evidence, and contradictions...</p>
            </div>
            <div className="space-y-4 pt-8 max-w-md mx-auto">
              <Skeleton className="h-16 w-full rounded-lg bg-gray-100" />
              <Skeleton className="h-16 w-full rounded-lg bg-gray-100" />
              <Skeleton className="h-16 w-full rounded-lg bg-gray-100" />
            </div>
          </div>
        )}

        {step === 'final' && stressResult && (
          <div className="w-full pb-20">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Stress Test Results</h2>
              <p className="text-gray-500 max-w-2xl mx-auto italic">&quot;{hypothesis}&quot;</p>
            </div>
            <ResultPanel result={stressResult} />
            <div className="mt-16 text-center">
              <Button variant="outline" onClick={() => setStep('idle')} className="h-12 px-8">
                Start Over
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
