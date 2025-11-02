import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Mic, Play, Pause, Download, User, Loader2 } from "lucide-react";
import { generatePodcast, getPodcastAudioUrl } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";

interface PodcastSegment {
  speaker: string;
  text: string;
}

export default function Podcast() {
  const [settings, setSettings] = useState({
    topic: "",
    podcastStyle: "educational" as "educational" | "conversational" | "storytelling",
    duration: "medium" as "short" | "medium" | "long"
  });
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<PodcastSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load cached podcast on mount
  useEffect(() => {
    const cachedPodcast = cache.get<any>(CACHE_KEYS.PODCAST);
    if (cachedPodcast) {
      setScript(cachedPodcast.script || []);
      setAudioUrl(cachedPodcast.audioUrl || null);
      setGenerated(true);
      toast.success("Loaded cached podcast");
    }
  }, []);

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await generatePodcast({
        topic: settings.topic,
        podcastStyle: settings.podcastStyle,
        duration: settings.duration
      });
      
      setScript(response.script);
      // Construct full audio URL using the helper function
      const fullAudioUrl = response.podcastId ? getPodcastAudioUrl(response.podcastId) : null;
      
      // Cache the podcast data
      cache.set(CACHE_KEYS.PODCAST, {
        script: response.script,
        audioUrl: fullAudioUrl
      });
      
      setAudioUrl(fullAudioUrl);
      setGenerated(true);
      toast.success("Podcast generated and cached!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate podcast");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Podcast downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download podcast");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 pt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Mic className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Podcast Generator</h1>
          <p className="text-muted-foreground">Create AI-powered educational podcasts with TTS</p>
        </div>
      </div>

      {!generated ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Podcast Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic (Optional)</Label>
              <Input
                placeholder="e.g., Climate Change, Renaissance Art..."
                value={settings.topic}
                onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Podcast Style</Label>
              <Select
                value={settings.podcastStyle}
                onValueChange={(v) => setSettings(prev => ({ ...prev, podcastStyle: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational - Informative & structured</SelectItem>
                  <SelectItem value="conversational">Conversational - Casual & friendly</SelectItem>
                  <SelectItem value="storytelling">Storytelling - Narrative driven</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={settings.duration}
                onValueChange={(v) => setSettings(prev => ({ ...prev, duration: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (5-7 minutes)</SelectItem>
                  <SelectItem value="medium">Medium (10-15 minutes)</SelectItem>
                  <SelectItem value="long">Long (15-20 minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Podcast...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Generate Podcast
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Your Podcast is Ready!</h2>
                <p className="text-sm text-muted-foreground">
                  Featuring Bella & Heart • {settings.duration === "short" ? "5-7" : settings.duration === "medium" ? "10-15" : "15-20"} minutes
                </p>
              </div>
              {audioUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>

            {audioUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    className="shrink-0"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <div className="flex-1 space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <Label className="text-sm">Speed:</Label>
                  <div className="flex gap-1">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <Button
                        key={rate}
                        size="sm"
                        variant={playbackRate === rate ? "default" : "outline"}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className="h-7 px-2 text-xs"
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!audioUrl && (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Audio generation in progress or unavailable
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Podcast Script</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {script.map((segment, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      segment.speaker === "Bella" 
                        ? "bg-purple-500/20 text-purple-700 dark:text-purple-400" 
                        : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{segment.speaker}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{segment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
            Generate New Podcast
          </Button>
        </div>
      )}
    </div>
  );
}
