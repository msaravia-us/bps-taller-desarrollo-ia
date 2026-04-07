"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { apiFetch, ApiError } from "@/lib/api/client"
import type { AuthPayload } from "@/lib/api/types"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  displayName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(60, "At most 60 characters"),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", displayName: "" },
  })

  async function onSubmit(values: FormValues) {
    try {
      const data = await apiFetch<AuthPayload>("/auth/register", {
        method: "POST",
        body: {
          email: values.email,
          displayName: values.displayName.trim(),
        },
      })
      login(data)
      toast.success("Account created")
      router.replace("/projects")
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Could not register"
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Already registered?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.displayName}>
              <FieldLabel htmlFor="displayName">Display name</FieldLabel>
              <Input
                id="displayName"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.displayName}
                {...form.register("displayName")}
              />
              <FieldError errors={[form.formState.errors.displayName]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Creating…
                  </>
                ) : (
                  "Register"
                )}
              </Button>
              <FieldDescription>
                You will receive a JWT stored in this browser for API calls.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
