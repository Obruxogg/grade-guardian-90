import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "./login";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Repertório" },
      { name: "description", content: "Acesso seguro para equipe e alunos do Repertório." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const Component = LoginPage.component;
  return <Component />;
}