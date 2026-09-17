import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Repertório" },
      { name: "description", content: "Acesso seguro para equipe e alunos do Repertório." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});