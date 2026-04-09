import { CreateProjectForm } from "@/components/projects/create-project-form";

export default function NewProjectPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Crear proyecto
        </h1>
        <p className="text-muted-foreground">
          Define nombre y clave unica. La clave se usa para identificar el proyecto en listados.
        </p>
      </div>
      <CreateProjectForm />
    </div>
  );
}
