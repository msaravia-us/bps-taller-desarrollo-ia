"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { type LoginFormValues, loginFormSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);
    try {
      await login(data.email.trim());
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      setServerError(message);
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the email you registered with. This app does not use a password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="contents">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            {serverError ? (
              <FieldError>{serverError}</FieldError>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
        <p>
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
        <Link
          href="/"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </CardFooter>
    </Card>
  );
}
