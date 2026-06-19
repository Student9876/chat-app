"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, LogOut, User } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Navbar = () => {
	const { user, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	const [renderUser, setRenderUser] = useState(user);

	useEffect(() => {
		setRenderUser(user);
	}, [user]);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm py-3 px-6">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Brand Logo */}
				<Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
					<MessageSquare className="w-5 h-5 text-primary" />
					<span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">ChatApp</span>
				</Link>

				{/* Right Navigation Controls */}
				<div className="flex items-center gap-4">
					{/* Theme Switcher */}
					<ThemeToggle />

					{renderUser ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-9 w-9 rounded-full select-none cursor-pointer">
									<Avatar className="h-9 w-9 border border-border">
										<AvatarFallback className="bg-primary/10 text-primary font-semibold uppercase text-sm">
											{user?.username?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-semibold leading-none truncate text-foreground">{user?.username}</p>
										<p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild className="cursor-pointer">
									<Link href="/" className="flex w-full items-center gap-2">
										<User className="w-4 h-4" />
										<span>Dashboard</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
									<LogOut className="w-4 h-4 mr-2" />
									<span>Log Out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center gap-2 text-sm font-semibold">
							<Button asChild variant="ghost" size="sm">
								<Link href="/login" className={pathname === "/login" ? "text-primary font-bold" : ""}>
									Login
								</Link>
							</Button>
							<Button asChild size="sm">
								<Link href="/register">
									Register
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
