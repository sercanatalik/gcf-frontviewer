"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const routes = [
  { label: "Dashboard", href: "/" },
  { label: "Workspace", href: "/workspace" },
// 
]

export function NavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Menu className="size-4" />
          <span className="sr-only">Navigation</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routes.map((route) => (
          <DropdownMenuItem key={route.href} asChild>
            <Link href={route.href}>{route.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
