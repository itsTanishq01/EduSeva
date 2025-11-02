import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Download, Loader2, Maximize2 } from "lucide-react";
import { generateMindmap, MindmapResponse } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

interface TreeNode {
  name: string;
  attributes?: {
    id?: number;
    pid?: number | null;
    description?: string;
  };
  children?: TreeNode[];
}

export default function Mindmap() {
  const [settings, setSettings] = useState({
    topic: "",
    maxDepth: 4,
    maxNodesPerLevel: 8
  });
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load cached mindmap on mount
  useEffect(() => {
    const cachedData = cache.get<MindmapResponse>(CACHE_KEYS.MINDMAP);
    if (cachedData?.mindmap) {
      const { nodes: flowNodes, edges: flowEdges } = convertTreeToFlow(cachedData.mindmap, 0, null, 400);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setGenerated(true);
      toast.success("Loaded cached mindmap");
    }
  }, []);

  const convertTreeToFlow = (treeNode: TreeNode, level: number = 0, parentId: string | null = null, xOffset: number = 0, siblingIndex: number = 0, totalSiblings: number = 1): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const nodeId = `node-${treeNode.attributes?.id || Math.random()}`;
    
    // Improved spacing calculation to prevent overlap
    const baseHorizontalSpacing = 300;
    const baseVerticalSpacing = 180;
    
    // Increase spacing for deeper levels and more siblings
    const horizontalSpacing = baseHorizontalSpacing * (1 + level * 0.3);
    const verticalSpacing = baseVerticalSpacing * (1 + Math.min(level * 0.2, 1));
    
    // Calculate position with better distribution
    const x = xOffset;
    const y = level * verticalSpacing;
    
    // Determine node style based on level
    const getNodeStyle = (level: number) => {
      switch(level) {
        case 0: // Root
          return {
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
            color: 'white',
            border: '3px solid hsl(var(--primary))',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            width: 250,
            minHeight: 80,
          };
        case 1: // First level
          return {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '3px solid hsl(var(--primary))',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            width: 220,
            minHeight: 70,
          };
        default: // Deeper levels
          return {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '2px solid hsl(var(--foreground))',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            width: 200,
            minHeight: 60,
          };
      }
    };

    // Create current node
    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x, y },
      data: { 
        label: (
          <div style={{ textAlign: 'center', wordWrap: 'break-word' }}>
            <div>{treeNode.name}</div>
            {treeNode.attributes?.description && (
              <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                {treeNode.attributes.description.substring(0, 50)}
                {treeNode.attributes.description.length > 50 ? '...' : ''}
              </div>
            )}
          </div>
        )
      },
      style: getNodeStyle(level),
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // Create edge from parent if exists
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        animated: level <= 1,
        style: { 
          stroke: 'hsl(var(--foreground))',
          strokeWidth: 3
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--foreground))',
        },
      });
    }

    // Process children with better layout algorithm
    if (treeNode.children && treeNode.children.length > 0) {
      const childrenCount = treeNode.children.length;
      
      // Calculate total width needed for children with exponential spacing for many nodes
      const adjustedSpacing = childrenCount > 5 
        ? horizontalSpacing * (1 + Math.log2(childrenCount) * 0.2)
        : horizontalSpacing;
      
      const totalWidth = (childrenCount - 1) * adjustedSpacing;
      const startX = x - totalWidth / 2;

      treeNode.children.forEach((child, index) => {
        const childX = startX + index * adjustedSpacing;
        const { nodes: childNodes, edges: childEdges } = convertTreeToFlow(
          child,
          level + 1,
          nodeId,
          childX,
          index,
          childrenCount
        );
        nodes.push(...childNodes);
        edges.push(...childEdges);
      });
    }

    return { nodes, edges };
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await generateMindmap({
        topic: settings.topic,
        maxDepth: settings.maxDepth,
        maxNodesPerLevel: settings.maxNodesPerLevel
      });
      
      console.log("Mindmap response:", response);
      
      if (response.success && response.mindmap) {
        // Cache the response
        cache.set(CACHE_KEYS.MINDMAP, response);
        
        // Convert tree structure to ReactFlow format
        const { nodes: flowNodes, edges: flowEdges } = convertTreeToFlow(response.mindmap, 0, null, 400);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setGenerated(true);
        toast.success("Mindmap generated and cached!");
      } else {
        toast.error("Failed to generate mindmap - no data received");
      }
    } catch (error) {
      console.error("Mindmap generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate mindmap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = useCallback(() => {
    const reactFlowElement = document.querySelector('.react-flow');
    if (!reactFlowElement) return;

    // Simple export - you could enhance this with html2canvas or similar
    toast.success("To export, use the screenshot feature or print the page");
  }, []);

  const handleFitView = useCallback(() => {
    const reactFlowInstance = (window as any).reactFlowInstance;
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
  }, []);

  return (
    <div className="container max-w-6xl mx-auto p-6 pt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mindmap Generator</h1>
          <p className="text-muted-foreground">Visualize concepts in hierarchical mindmaps</p>
        </div>
      </div>

      {!generated ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mindmap Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic (Optional)</Label>
              <Input
                placeholder="e.g., Machine Learning, World War II..."
                value={settings.topic}
                onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maximum Depth</Label>
                <Select
                  value={settings.maxDepth.toString()}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, maxDepth: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} levels</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Nodes Per Branch</Label>
                <Select
                  value={settings.maxNodesPerLevel.toString()}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, maxNodesPerLevel: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 8, 10, 15].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} nodes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Network className="mr-2 h-5 w-5" />
                  Generate Mindmap
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Mindmap</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleFitView}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fit View
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="h-[700px] w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={(instance) => {
                  (window as any).reactFlowInstance = instance;
                  instance.fitView({ padding: 0.2, duration: 800 });
                }}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                }}
              >
                <Background />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    return 'hsl(var(--primary))';
                  }}
                  maskColor="rgba(0, 0, 0, 0.1)"
                />
                <Panel position="top-right" className="bg-card/80 backdrop-blur-sm p-2 rounded-lg border">
                  <div className="text-xs text-muted-foreground">
                    Use scroll to zoom • Drag to pan
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </Card>

          <Button onClick={() => setGenerated(false)} variant="outline" className="w-full">
            Generate New Mindmap
          </Button>
        </div>
      )}
    </div>
  );
}
