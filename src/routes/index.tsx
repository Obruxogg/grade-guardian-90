import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Área do aluno | Repertório" },
    { name: "description", content: "Acesse suas provas e resultados acadêmicos com segurança." },
    { property: "og:title", content: "Área do aluno | Repertório" },
    { property: "og:description", content: "Acesse suas provas e resultados acadêmicos com segurança." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <main className="min-h-screen bg-background">
    <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
      <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-semibold text-primary-foreground">R</span><div><p className="font-display text-lg font-semibold leading-none">Repertório</p><p className="mt-1 text-xs text-muted-foreground">Sistema de Avaliações</p></div></div>
      <Button asChild variant="ghost" className="ml-auto"><Link to="/auth">Acesso da equipe</Link></Button>
    </div></header>
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
      <div><span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><ShieldCheck className="size-4"/> Acesso protegido</span>
        <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">Suas avaliações, em um lugar simples e seguro.</h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Entre para continuar uma prova, responder uma nova avaliação ou consultar resultados já liberados.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="h-12 px-6 text-base"><Link to="/auth"><GraduationCap/> Entrar na área do aluno</Link></Button></div>
        <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2"><div className="flex gap-3"><BookOpenCheck className="mt-0.5 size-5 text-primary"/><div><p className="font-semibold">Retome de onde parou</p><p className="mt-1 text-sm text-muted-foreground">Respostas salvas permanecem protegidas.</p></div></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 text-primary"/><div><p className="font-semibold">Seus dados são privados</p><p className="mt-1 text-sm text-muted-foreground">Cada aluno acessa somente suas informações.</p></div></div></div>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"><p className="text-xs font-semibold uppercase text-muted-foreground">Área do aluno</p><h2 className="mt-3 font-display text-2xl font-semibold">Como você deseja entrar?</h2><div className="mt-6 space-y-3"><Button asChild className="h-14 w-full justify-start px-5 text-base"><Link to="/auth"><GraduationCap/> CPF e senha segura</Link></Button><Button asChild variant="outline" className="h-14 w-full justify-start px-5 text-base"><Link to="/auth"><ShieldCheck/> E-mail institucional</Link></Button></div><p className="mt-5 text-sm leading-6 text-muted-foreground">No primeiro acesso, use os dados de ativação fornecidos pela escola. O CPF nunca aparece no endereço da página.</p></div>
    </section>
  </main>;
}
