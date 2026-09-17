import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => { throw redirect({ to: "/login" }); },
  head: () => ({ meta: [
    { title: "Entrar | Repertório" },
    { name: "description", content: "Acesso seguro ao Repertório para alunos e equipe." },
    { property: "og:title", content: "Entrar | Repertório" },
    { property: "og:description", content: "Acesso seguro ao Repertório para alunos e equipe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: () => null,
});