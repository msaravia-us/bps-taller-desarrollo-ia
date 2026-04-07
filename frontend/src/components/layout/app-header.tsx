"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOutIcon, FolderKanbanIcon, MenuIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
      <Link
        href="/projects"
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start md:justify-center"
        )}
      >
        Projects
      </Link>
    </nav>
  )
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials =
    user?.displayName
      ?.split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "?"

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <div className="flex flex-1 items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </Button>
            <SheetContent side="left" className="flex flex-col gap-6">
              <Link
                href="/projects"
                className="flex items-center gap-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                <FolderKanbanIcon />
                Issue Tracker
              </Link>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link
            href="/projects"
            className="hidden items-center gap-2 font-semibold md:flex"
          >
            <FolderKanbanIcon />
            Issue Tracker
          </Link>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <div className="m-1 hidden md:block">
            <NavLinks />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-full"
            )}
          >
            <Avatar className="size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuItem
              onClick={() => {
                logout()
                router.push("/login")
              }}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
