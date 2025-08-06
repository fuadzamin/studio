"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Clipboard,
  Factory,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Building,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/barang", label: "Barang", icon: Boxes },
  { href: "/penjualan", label: "Penjualan", icon: ShoppingCart },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/produksi", label: "Produksi", icon: Factory },
  { href: "/absensi", label: "Absensi", icon: Clipboard },
  { href: "/surat-jalan", label: "Surat Jalan", icon: Truck },
  { href: "/laporan", label: "Laporan", icon: FileBarChart },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Building className="size-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">ProFlow ERP</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: "right" }}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-sm">Admin</p>
                <p className="text-xs text-muted-foreground">admin@proflow.com</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
