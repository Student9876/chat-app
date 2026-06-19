"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const BACKEND_URL = process.env.BACKEND_URL;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
				username,
				email,
				password,
			});
			if (res.status === 201) {
				router.push("/login");
			}
		} catch {
			setError("Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center bg-background px-4 py-8">
			<Card className="w-full max-w-md shadow-lg border border-border">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
					<CardDescription>
						Sign up to start chatting in real-time
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
									<User className="w-4 h-4" />
								</span>
								<Input
									type="text"
									id="username"
									placeholder="johndoe"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="pl-9"
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
									<Mail className="w-4 h-4" />
								</span>
								<Input
									type="email"
									id="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-9"
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
									<Lock className="w-4 h-4" />
								</span>
								<Input
									type="password"
									id="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-9"
									required
								/>
							</div>
						</div>
						{error && (
							<div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3 text-sm border border-destructive/20">
								<AlertCircle className="w-4 h-4 shrink-0" />
								<p>{error}</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Registering...
								</>
							) : (
								"Register"
							)}
						</Button>
						<div className="text-center text-sm text-muted-foreground w-full">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:underline font-semibold">
								Login here
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default RegisterPage;
