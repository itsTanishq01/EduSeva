import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Bell, Lock, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 pt-20 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your activity
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get push notifications on your device
              </p>
            </div>
            <Switch id="push-notifications" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Privacy</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="data-collection">Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect usage data to improve your experience
              </p>
            </div>
            <Switch id="data-collection" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="analytics">Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing anonymous usage statistics
              </p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth animations and transitions
              </p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
