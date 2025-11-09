import { Card } from "@/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountDetails() {
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");
      setCreatedAt(user.created_at || "");

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
      }
    };

    fetchUserData();
  }, [navigate]);

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
            <h2 className="text-2xl font-semibold text-foreground">{fullName || "User Account"}</h2>
            <p className="text-sm text-muted-foreground">Active member</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{email || "Loading..."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium text-foreground">{createdAt ? new Date(createdAt).toLocaleDateString() : "Loading..."}</p>
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
