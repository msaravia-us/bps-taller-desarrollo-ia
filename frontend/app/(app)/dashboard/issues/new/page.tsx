import { CreateIssueForm } from "@/components/issues/create-issue-form";

export default function NewIssuePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Crear issue
        </h1>
        <p className="text-muted-foreground">
          Los issues se asocian a un proyecto. Elige proyecto y titulo como minimo.
        </p>
      </div>
      <CreateIssueForm />
    </div>
  );
}
