import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export type NavItem = { label: string; to: string; icon: LucideIcon };

export function WorkspaceShell({ area, items, children }: { area: string; items: NavItem[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  async function logout() { await auth.signOut(); await navigate({ to: "/login", replace: true }); }
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
    <aside className={`${open ? "block" : "hidden"} border-r bg-card lg:block`}><div className="sticky top-0 flex min-h-screen flex-col p-4"><Link to={auth.role === "admin" ? "/admin" : "/professor"} className="flex items-center gap-3 px-2 py-3"><span className="grid size-10 place-items-center rounded-lg bg-primary font-display text-xl font-semibold text-primary-foreground">R</span><span><strong className="block font-display text-lg">Repertório</strong><span className="text-xs text-muted-foreground">{area}</span></span></Link><nav className="mt-6 space-y-1" aria-label={`Menu ${area}`}>{items.map((item) => <Button key={item.label} asChild variant="ghost" className="h-11 w-full justify-start"><Link to={item.to}><item.icon />{item.label}</Link></Button>)}</nav><Button variant="outline" className="mt-auto h-11 justify-start" onClick={logout}><LogOut/> Sair</Button></div></aside>
    <div><header className="flex h-16 items-center gap-3 border-b bg-card px-5 lg:px-8"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(!open)}><Menu/></Button><div className="ml-auto text-right"><p className="text-sm font-semibold">{auth.profile?.full_name ?? "Usuário"}</p><p className="text-xs text-muted-foreground">{area}</p></div></header><main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</main></div>
  </div>;
}