import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => { throw redirect({to:"/admin"}); },
  component: () => <Outlet/>,
});