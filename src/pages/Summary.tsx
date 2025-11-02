import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Copy, Loader2 } from "lucide-react";
import { summarizeDocument } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";

interface PageSummary {
  page: number;
  summary: string;
}

export default function Summary() {
  const [settings, setSettings] = useState({
    summaryType: "comprehensive" as "brief" | "comprehensive" | "detailed",
    includePageNumbers: true
  });
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<{
    overall: string;
    pageWise: PageSummary[];
    keyTopics: string[];
  }>({
    overall: "",
    pageWise: [],
    keyTopics: []
  });

  // Load cached summary on mount
  useEffect(() => {
    const cachedSummary = cache.get<any>(CACHE_KEYS.SUMMARY);
    if (cachedSummary) {
      setSummary({
        overall: cachedSummary.overall || "",
        pageWise: cachedSummary.pageWise || [],
        keyTopics: cachedSummary.keyTopics || []
      });
      setGenerated(true);
      toast.success("Loaded cached summary");
    }
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await summarizeDocument({
        summaryType: settings.summaryType,
        includePageNumbers: settings.includePageNumbers
      });
      
      console.log("Summary response:", response);
      
      if (response.success && response.summary) {
        const s: any = response.summary;
        const summaryData = {
          overall: s.overall ?? s.overallSummary ?? "",
          pageWise: s.pageWise ?? s.pageWiseSummary ?? [],
          keyTopics: s.keyTopics ?? [],
        };
        
        // Cache the summary
        cache.set(CACHE_KEYS.SUMMARY, summaryData);
        
        setSummary(summaryData);
        setGenerated(true);
        toast.success("Summary generated and cached!");
      } else {
        toast.error("Failed to generate summary - no data received");
      }
    } catch (error) {
      console.error("Summary generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryTypeDescription = () => {
    switch (settings.summaryType) {
      case "brief":
        return "1-2 sentences per page";
      case "comprehensive":
        return "Paragraph per page";
      case "detailed":
        return "In-depth analysis";
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.overall);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 pt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Summarizer</h1>
          <p className="text-muted-foreground">Generate AI-powered summaries of your documents</p>
        </div>
      </div>

      {!generated ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary Settings</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Summary Type</Label>
              <Select
                value={settings.summaryType}
                onValueChange={(v) => setSettings(prev => ({ ...prev, summaryType: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">
                    <div className="flex flex-col items-start">
                      <span>Brief</span>
                      <span className="text-xs text-muted-foreground">1-2 sentences per page</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="comprehensive">
                    <div className="flex flex-col items-start">
                      <span>Comprehensive</span>
                      <span className="text-xs text-muted-foreground">Paragraph per page</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="detailed">
                    <div className="flex flex-col items-start">
                      <span>Detailed</span>
                      <span className="text-xs text-muted-foreground">In-depth analysis</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{getSummaryTypeDescription()}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Page Numbers</Label>
                <p className="text-sm text-muted-foreground">Show page references in summary</p>
              </div>
              <Switch
                checked={settings.includePageNumbers}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includePageNumbers: checked }))}
              />
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Overall Summary</h2>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">{summary.overall}</p>
            
            {summary.keyTopics?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Key Topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.keyTopics?.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {summary.pageWise?.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Page-by-Page Summary</h2>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {summary.pageWise?.map((pageSummary, index) => (
                    <div key={pageSummary.page}>
                      <div className="flex items-start gap-3">
                        {settings.includePageNumbers && (
                          <Badge variant="outline" className="shrink-0 mt-1">
                            Page {pageSummary.page}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          {pageSummary.summary}
                        </p>
                      </div>
                      {index < ((summary.pageWise?.length ?? 0) - 1) && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
            Generate New Summary
          </Button>
        </div>
      )}
    </div>
  );
}
