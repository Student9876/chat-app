"use client";

import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

const LoginPage = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await axios.post("http://localhost:5000/api/login", {email, password});
			if (res.status === 200) {
				// Store JWT token and user details
				const {token, user} = res.data;
				localStorage.setItem("token", token);
				localStorage.setItem("user", JSON.stringify(user));

				// Redirect to dashboard
				router.push("/dashboard");
			}
		} catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.error || "Login failed. Please try again.");
			} else {
				setError("Invalid credentials. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
				<h2 className="text-2xl font-bold text-center mb-6">Login</h2>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="email" className="block text-sm font-semibold">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md"
							placeholder="Enter your email"
							required
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-semibold">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md"
							placeholder="Enter your password"
							required
						/>
					</div>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className={`w-full p-2 text-white rounded-md ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
				<div className="text-center mt-4">
					<p className="text-sm">
						Don&apos;t have an account?
						<a href="/register" className="text-blue-600 hover:underline">
							Register here
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
