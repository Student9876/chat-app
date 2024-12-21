"use client";

import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await axios.post("http://localhost:5000/api/auth/register", {
				username,
				email,
				password,
			});
			if (res.status === 201) {
				router.push("/login"); // Redirect to login after successful registration
			}
		} catch {
			setError("Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<div className="max-w-md w-full p-6 bg-white shadow-lg rounded-lg">
				<h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create an Account</h2>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="username" className="block text-sm font-semibold text-gray-700">
							Username
						</label>
						<input
							type="text"
							id="username"
							name="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your username"
							required
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-sm font-semibold text-gray-700">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your email"
							required
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-semibold text-gray-700">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter your password"
							required
						/>
					</div>
					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className={`w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition ${
							loading ? "opacity-50 cursor-not-allowed" : ""
						}`}>
						{loading ? "Registering..." : "Register"}
					</button>
				</form>
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<a href="/login" className="text-blue-600 hover:underline">
							Login
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
