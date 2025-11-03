import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer, Loader2 } from "lucide-react";
import { generateQuestionPaper } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";
import ReactMarkdown from "react-markdown";

interface Question {
  question: string;
  marks: number;
  expectedWords: number;
  category: string;
  answer: string;
}

interface QuestionPaperResponse {
  success: boolean;
  questionPaper: Question[];
  metadata?: {
    documentId: string;
    filename: string;
    difficulty: string;
    totalQuestions: number;
    totalMarks: number;
    breakdown: {
      oneMark: number;
      twoMark: number;
      threeMark: number;
    };
    generatedAt: string;
  };
  documentId?: string;
  hasAnswers?: boolean;
}

export default function QuestionPaper() {
  const [settings, setSettings] = useState({
    oneMarkCount: 10,
    twoMarkCount: 8,
    threeMarkCount: 8,
    topic: "",
    difficulty: "mixed" as "easy" | "medium" | "hard" | "mixed"
  });
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());

  // Load cached question paper on mount
  useEffect(() => {
    const cachedPaper = cache.get<Question[]>(CACHE_KEYS.QUESTION_PAPER);
    if (cachedPaper && Array.isArray(cachedPaper)) {
      setQuestions(cachedPaper);
      setGenerated(true);
      toast.success("Loaded cached question paper");
    }
  }, []);

  // Clear cache on page reload/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      cache.remove(CACHE_KEYS.QUESTION_PAPER);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await generateQuestionPaper({
        oneMarkCount: settings.oneMarkCount,
        twoMarkCount: settings.twoMarkCount,
        threeMarkCount: settings.threeMarkCount,
        topic: settings.topic,
        difficulty: settings.difficulty
      });
      
      console.log("Question paper response:", response);
      
      if (response.success && response.questionPaper && Array.isArray(response.questionPaper)) {
        // Cache the question paper
        cache.set(CACHE_KEYS.QUESTION_PAPER, response.questionPaper);
        
        setQuestions(response.questionPaper);
        setGenerated(true);
        setVisibleAnswers(new Set());
        toast.success("Question paper generated and cached!");
      } else {
        toast.error("Failed to generate question paper - no data received");
      }
    } catch (error) {
      console.error("Question paper generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate question paper");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setVisibleAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const totalMarks = settings.oneMarkCount * 1 + settings.twoMarkCount * 2 + settings.threeMarkCount * 3;

  const handleDownload = () => {
    const content = generatePaperContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-paper-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded question paper");
  };

  const generatePaperContent = () => {
    let content = "QUESTION PAPER\n";
    content += "=".repeat(50) + "\n\n";
    content += `Total Marks: ${totalMarks}\n`;
    content += `Difficulty: ${settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)}\n`;
    if (settings.topic) content += `Topic: ${settings.topic}\n`;
    content += "\n" + "=".repeat(50) + "\n\n";

    const oneMarkQs = questions.filter(q => q.marks === 1);
    const twoMarkQs = questions.filter(q => q.marks === 2);
    const threeMarkQs = questions.filter(q => q.marks === 3);

    if (oneMarkQs.length > 0) {
      content += "SECTION A - 1-Mark Questions (≈20 words each)\n\n";
      oneMarkQs.forEach((q, i) => {
        content += `${i + 1}. ${q.question}\n\n`;
      });
      content += "\n";
    }

    if (twoMarkQs.length > 0) {
      content += "SECTION B - 2-Mark Questions (≈40 words each)\n\n";
      twoMarkQs.forEach((q, i) => {
        content += `${i + 1}. ${q.question}\n\n`;
      });
      content += "\n";
    }

    if (threeMarkQs.length > 0) {
      content += "SECTION C - 3-Mark Questions (≈80 words each)\n\n";
      threeMarkQs.forEach((q, i) => {
        content += `${i + 1}. ${q.question}\n\n`;
      });
    }

    return content;
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog");
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 pt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Paper Generator</h1>
          <p className="text-muted-foreground">Generate custom question papers from your documents</p>
        </div>
      </div>

      {!generated ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Paper Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>1-Mark Questions (≈20 words)</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={settings.oneMarkCount}
                onChange={(e) => setSettings(prev => ({ ...prev, oneMarkCount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>2-Mark Questions (≈40 words)</Label>
              <Input
                type="number"
                min="0"
                max="30"
                value={settings.twoMarkCount}
                onChange={(e) => setSettings(prev => ({ ...prev, twoMarkCount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>3-Mark Questions (≈80 words)</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={settings.threeMarkCount}
                onChange={(e) => setSettings(prev => ({ ...prev, threeMarkCount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                value={settings.difficulty}
                onValueChange={(v) => setSettings(prev => ({ ...prev, difficulty: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Topic (Optional)</Label>
              <Input
                placeholder="e.g., Cell Biology, Data Structures..."
                value={settings.topic}
                onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Total Questions: <span className="font-semibold text-foreground">
                {settings.oneMarkCount + settings.twoMarkCount + settings.threeMarkCount}
              </span>
              {" • "}
              Total Marks: <span className="font-semibold text-foreground">{totalMarks}</span>
            </p>
          </div>

          <Button onClick={handleGenerate} className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Generate Question Paper
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Question Paper</h2>
                <p className="text-sm text-muted-foreground">
                  Total Marks: {totalMarks} • {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)} Level
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-8 pr-4">
                {questions.filter(q => q.marks === 1).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">Section A</Badge>
                      <h3 className="text-lg font-semibold">1-Mark Questions</h3>
                      <span className="text-sm text-muted-foreground">
                        (Answer in ≈20 words each)
                      </span>
                    </div>
                    <div className="space-y-4">
                      {questions.filter(q => q.marks === 1).map((q, index) => {
                        const globalIndex = questions.findIndex(question => question === q);
                        return (
                          <div key={index} className="space-y-2">
                            <div 
                              className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                              onClick={() => toggleAnswer(globalIndex)}
                            >
                              <span className="font-medium text-muted-foreground min-w-[2rem]">
                                {index + 1}.
                              </span>
                              <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{q.question}</ReactMarkdown>
                              </div>
                              <Badge variant="secondary" className="shrink-0">1M</Badge>
                            </div>
                            {visibleAnswers.has(globalIndex) && (
                              <div className="ml-11 p-3 bg-primary/5 border border-primary/20 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-sm font-semibold mb-1">Answer:</p>
                                <ReactMarkdown>{q.answer}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {questions.filter(q => q.marks === 2).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">Section B</Badge>
                        <h3 className="text-lg font-semibold">2-Mark Questions</h3>
                        <span className="text-sm text-muted-foreground">
                          (Answer in ≈40 words each)
                        </span>
                      </div>
                      <div className="space-y-4">
                        {questions.filter(q => q.marks === 2).map((q, index) => {
                          const globalIndex = questions.findIndex(question => question === q);
                          return (
                            <div key={index} className="space-y-2">
                              <div 
                                className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                                onClick={() => toggleAnswer(globalIndex)}
                              >
                                <span className="font-medium text-muted-foreground min-w-[2rem]">
                                  {index + 1}.
                                </span>
                                <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{q.question}</ReactMarkdown>
                                </div>
                                <Badge variant="secondary" className="shrink-0">2M</Badge>
                              </div>
                              {visibleAnswers.has(globalIndex) && (
                                <div className="ml-11 p-3 bg-primary/5 border border-primary/20 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                                  <p className="text-sm font-semibold mb-1">Answer:</p>
                                  <ReactMarkdown>{q.answer}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {questions.filter(q => q.marks === 3).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">Section C</Badge>
                        <h3 className="text-lg font-semibold">3-Mark Questions</h3>
                        <span className="text-sm text-muted-foreground">
                          (Answer in ≈80 words each)
                        </span>
                      </div>
                      <div className="space-y-4">
                        {questions.filter(q => q.marks === 3).map((q, index) => {
                          const globalIndex = questions.findIndex(question => question === q);
                          return (
                            <div key={index} className="space-y-2">
                              <div 
                                className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                                onClick={() => toggleAnswer(globalIndex)}
                              >
                                <span className="font-medium text-muted-foreground min-w-[2rem]">
                                  {index + 1}.
                                </span>
                                <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{q.question}</ReactMarkdown>
                                </div>
                                <Badge variant="secondary" className="shrink-0">3M</Badge>
                              </div>
                              {visibleAnswers.has(globalIndex) && (
                                <div className="ml-11 p-3 bg-primary/5 border border-primary/20 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                                  <p className="text-sm font-semibold mb-1">Answer:</p>
                                  <ReactMarkdown>{q.answer}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </Card>

          <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
            Generate New Paper
          </Button>
        </div>
      )}
    </div>
  );
}
