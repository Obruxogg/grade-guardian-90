import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar | Repertório" },
    { name: "description", content: "Acesso seguro ao Repertório para alunos e equipe." },
    { property: "og:title", content: "Entrar | Repertório" },
    { property: "og:description", content: "Acesso seguro ao Repertório para alunos e equipe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  async function submit(e: React.FormEvent){ e.preventDefault(); setLoading(true); setError(""); const { error: authError }=await supabase.auth.signInWithPassword({email,password}); setLoading(false); if(authError){setError("Não foi possível entrar. Confira seus dados e tente novamente.");return;} await navigate({to:"/dashboard"}); }
  async function google(){ setError(""); const result=await lovable.auth.signInWithOAuth("google",{redirect_uri:window.location.origin}); if(result.error)setError("Não foi possível entrar com o Google."); }
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-10"><section className="w-full max-w-md"><div className="mb-8 flex items-center justify-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary font-display text-xl font-semibold text-primary-foreground">R</span><div><h1 className="font-display text-xl font-semibold">Repertório</h1><p className="text-xs text-muted-foreground">Acesso seguro</p></div></div><div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"><div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground"><ShieldCheck/></div><h2 className="mt-5 font-display text-2xl font-semibold">Entre na sua conta</h2><p className="mt-2 text-sm text-muted-foreground">Use o acesso fornecido pela escola.</p><form className="mt-6 space-y-4" onSubmit={submit}><div><label htmlFor="email" className="mb-2 block text-sm font-semibold">E-mail</label><Input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="h-11 bg-background"/></div><div><label htmlFor="password" className="mb-2 block text-sm font-semibold">Senha</label><div className="relative"><Input id="password" type={show?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="h-11 bg-background pr-11"/><Button type="button" variant="ghost" size="icon" aria-label={show?"Ocultar senha":"Mostrar senha"} onClick={()=>setShow(!show)} className="absolute right-1 top-1">{show?<EyeOff/>:<Eye/>}</Button></div></div>{error&&<p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading} className="h-11 w-full">{loading?<Loader2 className="animate-spin"/>:null} Entrar</Button></form><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>ou<span className="h-px flex-1 bg-border"/></div><Button type="button" variant="outline" onClick={google} className="h-11 w-full">Continuar com Google</Button></div><p className="mt-5 text-center text-xs text-muted-foreground">Problemas para entrar? Procure a secretaria da escola.</p></section></main>;
}