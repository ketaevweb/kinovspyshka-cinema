"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus, Film } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(t("auth.wrongCredentials"));
    } else {
      toast.success(t("auth.welcome"));
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const name = fd.get("name") as string;

    if (password.length < 6) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await regRes.json();

      if (!regRes.ok) {
        toast.error(data.error || t("auth.registerError"));
        setLoading(false);
        return;
      }

      // Автоматический вход после регистрации
      await signIn("credentials", { email, password, redirect: false });
      toast.success(t("auth.accountCreated"));
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(t("auth.networkError"));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-card/95">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <Film className="h-5 w-5 text-cinema" />
          {t("auth.title")}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {t("auth.subtitle")}
        </DialogDescription>

        <Tabs defaultValue="login" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5">
              <LogIn className="h-4 w-4" /> {t("auth.login")}
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5">
              <UserPlus className="h-4 w-4" /> {t("auth.register")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
                <Input name="email" type="email" required placeholder="you@example.com" className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("auth.password")}</label>
                <Input name="password" type="password" required placeholder="••••••" className="bg-background/60" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 bg-cinema hover:bg-cinema/90">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("auth.signIn")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("auth.name")}</label>
                <Input name="name" type="text" placeholder={t("auth.namePlaceholder")} className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
                <Input name="email" type="email" required placeholder="you@example.com" className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("auth.passwordHint")}</label>
                <Input name="password" type="password" required placeholder="••••••" className="bg-background/60" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 bg-cinema hover:bg-cinema/90">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("auth.createAccount")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
