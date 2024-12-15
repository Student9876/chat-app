"use client";

import React from "react";
import Link from "next/link";
import {useAuth} from "../../app/context/AuthContext";

const Navbar = () => {
	const {user, logout} = useAuth();

	return (
		<nav className="bg-gray-800 p-4 text-white">
			<ul className="flex space-x-6">
				<li>
					<Link href="/">Home</Link>
				</li>
				{user ? (
					<>
						<li>
							<Link href="/dashboard">Dashboard</Link>
						</li>
						<li>
							<button onClick={logout} className="text-red-500">
								Logout
							</button>
						</li>
					</>
				) : (
					<>
						<li>
							<Link href="/login">Login</Link>
						</li>
						<li>
							<Link href="/register">Register</Link>
						</li>
					</>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
