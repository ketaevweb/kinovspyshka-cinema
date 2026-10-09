"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus, Film } from "lucide-react";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
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
      toast.error("Неверный email или пароль");
    } else {
      toast.success("Добро пожаловать!");
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
      toast.error("Пароль должен быть не менее 6 символов");
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
        toast.error(data.error || "Ошибка регистрации");
        setLoading(false);
        return;
      }

      // Автоматический вход после регистрации
      await signIn("credentials", { email, password, redirect: false });
      toast.success("Аккаунт создан!");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Ошибка сети");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-card/95">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <Film className="h-5 w-5 text-cinema" />
          Войти в КиноВспышку
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Синхронизируйте избранное между устройствами
        </DialogDescription>

        <Tabs defaultValue="login" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5">
              <LogIn className="h-4 w-4" /> Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5">
              <UserPlus className="h-4 w-4" /> Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <Input name="email" type="email" required placeholder="you@example.com" className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Пароль</label>
                <Input name="password" type="password" required placeholder="••••••" className="bg-background/60" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 bg-cinema hover:bg-cinema/90">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Войти
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Имя (необязательно)</label>
                <Input name="name" type="text" placeholder="Как вас зовут" className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <Input name="email" type="email" required placeholder="you@example.com" className="bg-background/60" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Пароль (мин. 6 символов)</label>
                <Input name="password" type="password" required placeholder="••••••" className="bg-background/60" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 bg-cinema hover:bg-cinema/90">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Создать аккаунт
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
