import { StressTestResult } from "@/lib/pipeline/stressTest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, AlertTriangle, CheckCircle2, XCircle, Search, Lightbulb } from "lucide-react";

export function ResultPanel({ result }: { result: StressTestResult }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Novelty Score */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" /> Novelty Signal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-light tracking-tighter text-gray-900">
                {Math.round(result.noveltySignal * 100)}%
              </span>
            </div>
            <Progress value={result.noveltySignal * 100} className="h-1" />
            <div className="mt-4 text-sm text-gray-600">
              Closest work: <span className="font-medium text-gray-900">{result.closestExistingWork[0] || "None found"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Support */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Evidence Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-4xl font-light tracking-tighter text-gray-900">
                {Math.round(result.evidenceSupport * 100)}%
              </span>
            </div>
            <Progress value={result.evidenceSupport * 100} className="h-1 bg-gray-100 [&>div]:bg-green-600" />
            <div className="mt-4 text-sm text-gray-600">
              Contradiction Risk: <span className="font-medium text-red-600">{Math.round(result.contradictionRisk * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-gray-100" />

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Supporting Evidence
            </h3>
            <ul className="space-y-3">
              {result.supportingEvidence.length > 0 ? (
                result.supportingEvidence.map((ev, i) => (
                  <li key={i} className="text-sm text-gray-600 leading-relaxed border-l-2 border-green-200 pl-3 py-1">
                    {ev}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No direct supporting evidence found.</p>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <XCircle className="w-4 h-4 mr-2 text-red-600" /> Conflicting Evidence
            </h3>
            <ul className="space-y-3">
              {result.conflictingEvidence.length > 0 ? (
                result.conflictingEvidence.map((ev, i) => (
                  <li key={i} className="text-sm text-gray-600 leading-relaxed border-l-2 border-red-200 pl-3 py-1">
                    {ev}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No conflicting evidence found.</p>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Unsupported Assumptions
            </h3>
            <ul className="space-y-2">
              {result.unsupportedAssumptions.length > 0 ? (
                result.unsupportedAssumptions.map((ass, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    <Badge variant="secondary" className="font-normal text-xs mb-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border-none">Assumption</Badge>
                    <p>{ass}</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No major unsupported assumptions identified.</p>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <Search className="w-4 h-4 mr-2 text-blue-500" /> Missing Evidence
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-md">
              {result.missingEvidence}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-100" />

      {/* Recommended Experiment */}
      <Card className="bg-gray-50 border-none shadow-none">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3 uppercase tracking-wider">
            <FlaskConical className="w-4 h-4 mr-2" /> Recommended Experiment
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed font-mono">
            {result.recommendedExperiment}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
