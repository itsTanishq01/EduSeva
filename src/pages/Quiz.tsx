import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Brain, CheckCircle2, XCircle, Trophy, Target, Loader2 } from "lucide-react";
import { generateQuiz, submitQuiz } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  difficulty: string;
}

interface QuizResult {
  questionId: string;
  question: string;
  options: Record<string, string>;
  userAnswer: string;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
  correctAnswerExplanation: string;
  difficulty: string;
  wrongAnswerExplanation?: string;
  userAnswerText: string;
  allWrongAnswerExplanations: Record<string, string>;
}

export default function Quiz() {
  const [activeTab, setActiveTab] = useState<"generate" | "take">("generate");
  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 10,
    difficulty: "medium" as "easy" | "medium" | "hard",
    topic: ""
  });
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cached quiz on mount
  useEffect(() => {
    const cachedQuiz = cache.get<any>(CACHE_KEYS.QUIZ);
    if (cachedQuiz) {
      setQuiz(cachedQuiz.questions || []);
      setQuizId(cachedQuiz.quizId || null);
      if (cachedQuiz.questions?.length > 0) {
        setActiveTab("take");
        toast.success("Loaded cached quiz");
      }
    }
  }, []);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await generateQuiz({
        numQuestions: quizSettings.numQuestions,
        difficulty: quizSettings.difficulty,
        topic: quizSettings.topic
      });
      
      // Cache the quiz
      cache.set(CACHE_KEYS.QUIZ, {
        questions: response.quiz.questions,
        quizId: response.quiz.quizId
      });
      
      setQuiz(response.quiz.questions);
      setQuizId(response.quiz.quizId);
      setActiveTab("take");
      setAnswers({});
      setSubmitted(false);
      setResults(null);
      setSummary(null);
      toast.success("Quiz generated and cached!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await submitQuiz(quizId, answers);
      setResults(response.results);
      setSummary(response.summary);
      setSubmitted(true);
      toast.success(`Quiz completed! Score: ${response.summary.score}%`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "hard": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 pt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quiz Generator</h1>
          <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "take")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Quiz</TabsTrigger>
          <TabsTrigger value="take" disabled={quiz.length === 0}>Take Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select
                  value={quizSettings.numQuestions.toString()}
                  onValueChange={(v) => setQuizSettings(prev => ({ ...prev, numQuestions: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 30].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} questions</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={quizSettings.difficulty}
                  onValueChange={(v) => setQuizSettings(prev => ({ ...prev, difficulty: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topic (Optional)</Label>
                <Input
                  placeholder="e.g., Machine Learning, World History..."
                  value={quizSettings.topic}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>

              <Button onClick={handleGenerateQuiz} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="take" className="space-y-6">
          {!submitted ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(answers).length} / {quiz.length} answered
                  </span>
                </div>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length !== quiz.length || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-6 pr-4">
                  {quiz.map((question, index) => (
                    <Card key={question.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono">Q{index + 1}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <p className="text-lg font-medium">{question.question}</p>
                        </div>
                      </div>

                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        <div className="space-y-3">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                            >
                              <RadioGroupItem value={key} id={`${question.id}-${key}`} />
                              <Label
                                htmlFor={`${question.id}-${key}`}
                                className="flex-1 cursor-pointer"
                              >
                                <span className="font-medium">{key}.</span> {value}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="space-y-6">
              <Card className="p-8 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-5xl font-bold text-primary my-4">{summary?.score}%</p>
                <Badge className="text-lg px-4 py-2">{summary?.performanceLevel}</Badge>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{summary?.correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </Card>
                <Card className="p-4 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold">{summary?.incorrectAnswers}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </Card>
                <Card className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{summary?.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </Card>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
                  {results?.map((result, index) => (
                    <Card key={result.questionId} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono">Q{index + 1}</Badge>
                            <Badge className={getDifficultyColor(result.difficulty)}>
                              {result.difficulty}
                            </Badge>
                            {result.isCorrect ? (
                              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Correct
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg font-medium mb-4">{result.question}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(result.options).map(([key, value]) => {
                          const isUserAnswer = result.userAnswer === key;
                          const isCorrectAnswer = result.correctAnswer === key;
                          
                          return (
                            <div
                              key={key}
                              className={`rounded-lg border p-4 ${
                                isCorrectAnswer
                                  ? "bg-green-500/10 border-green-500"
                                  : isUserAnswer && !result.isCorrect
                                  ? "bg-red-500/10 border-red-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-medium">{key}.</span> {value}
                                </div>
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                                {isUserAnswer && !result.isCorrect && (
                                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                )}
                              </div>
                              
                              {isCorrectAnswer && (
                                <div className="mt-3 pt-3 border-t border-green-500/20">
                                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                    Why this is correct:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {result.correctAnswerExplanation}
                                  </p>
                                </div>
                              )}
                              
                              {isUserAnswer && !result.isCorrect && result.wrongAnswerExplanation && (
                                <div className="mt-3 pt-3 border-t border-red-500/20">
                                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                                    Why this is incorrect:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {result.wrongAnswerExplanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Button onClick={() => setActiveTab("generate")} className="w-full" size="lg">
                Generate New Quiz
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
