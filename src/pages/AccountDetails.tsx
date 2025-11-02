import { Card } from "@/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountDetails() {
  return (
    <div className="container max-w-4xl mx-auto p-6 pt-20 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Details</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">User Account</h2>
            <p className="text-sm text-muted-foreground">Active member</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">user@example.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium text-foreground">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
