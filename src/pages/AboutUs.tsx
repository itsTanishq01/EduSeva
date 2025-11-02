import { Card } from "@/components/ui/card";
import { Bot, Instagram, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Pranav Kumar",
    role: "Backend/Frontend",
    instagram: "",
    linkedin: "",
    github: "",
  },
  {
    name: "Tanishq Nimje",
    role: "Full Stack",
    instagram: "",
    linkedin: "",
    github: "",
  },
  {
    name: "Aryan Behera",
    role: "Frontend",
    instagram: "",
    linkedin: "",
    github: "",
  },
  {
    name: "Rahul Lenda",
    role: "LLM",
    instagram: "",
    linkedin: "",
    github: "",
  },
  {
    name: "Oishani Banerjee",
    role: "UI/UX",
    instagram: "",
    linkedin: "",
    github: "",
  },
  {
    name: "Sejal Nath",
    role: "Documentation",
    instagram: "",
    linkedin: "",
    github: "",
  },
];

export default function AboutUs() {
  return (
    <div className="container max-w-6xl mx-auto p-6 pt-20 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">About EduSeva</h1>
          <p className="text-muted-foreground">Learn more about our mission and team</p>
        </div>
      </div>

      <Card className="p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Our Purpose</h2>
        <p className="text-muted-foreground leading-relaxed">
          EduSeva was developed to revolutionize the way students learn and interact with educational content. 
          Our AI-powered study assistant helps students transform their study materials into interactive learning 
          experiences through features like flashcards, quizzes, mindmaps, podcasts, and intelligent chat assistance. 
          We believe in making education more accessible, engaging, and effective for learners everywhere by 
          leveraging cutting-edge artificial intelligence technology to create personalized learning experiences 
          that adapt to each student's unique needs and learning style.
        </p>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.name} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full justify-center"
                  onClick={() => member.instagram && window.open(member.instagram, "_blank")}
                  disabled={!member.instagram}
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full justify-center"
                  onClick={() => member.linkedin && window.open(member.linkedin, "_blank")}
                  disabled={!member.linkedin}
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full justify-center"
                  onClick={() => member.github && window.open(member.github, "_blank")}
                  disabled={!member.github}
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
