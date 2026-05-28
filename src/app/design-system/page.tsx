import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { cn } from "@/lib/utils";

const SWATCHES = [
  { name: "background", class: "bg-background" },
  { name: "foreground", class: "bg-foreground" },
  { name: "card", class: "bg-card border border-border" },
  { name: "muted", class: "bg-muted" },
  { name: "accent", class: "bg-accent" },
  { name: "success", class: "bg-success" },
  { name: "destructive", class: "bg-destructive" },
  { name: "warning", class: "bg-warning" },
] as const;

export default function DesignSystemPage() {
  return (
    <div className="min-h-full p-8 sm:p-10 max-w-2xl mx-auto space-y-12">
      <div>
        <Link
          href="/"
          className="text-sm text-accent hover:underline transition-colors duration-200"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold mt-4">Design system</h1>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
          Calm refuge palette — warm neutrals, sage accent, soft semantics.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Appearance</h2>
        <ThemeSelector />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Color tokens</h2>
        <div className="grid grid-cols-4 gap-3">
          {SWATCHES.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div className={cn("h-12 w-full rounded-xl", s.class)} />
              <p className="text-xs text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Typography</h2>
        <div className="space-y-3">
          <p className="text-3xl font-semibold">Heading — practice with clarity</p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Body large — simulate conversations in a calm space before the real one.
          </p>
          <p className="text-sm text-muted-foreground">
            Body small — secondary guidance and metadata.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Inputs</h2>
        <Input placeholder="Text input" />
        <Textarea placeholder="Textarea" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Card & Badges</h2>
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
          </div>
          <p className="text-sm leading-relaxed">Card content with generous padding.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Alerts</h2>
        <Alert>Info alert — neutral guidance</Alert>
        <Alert variant="warning">Warning alert — gentle caution</Alert>
        <Alert variant="error">Error alert — soft destructive tone</Alert>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Steps</h2>
        <StepIndicator steps={["Context", "Person", "Chat"]} current={1} />
      </section>
    </div>
  );
}
