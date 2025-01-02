"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {useAuth} from "../../app/context/AuthContext";
import {useRouter} from "next/navigation";

const Navbar = () => {
	const {user, logout} = useAuth();
	const router = useRouter();

	// State to trigger re-render on user change
	const [renderUser, setRenderUser] = useState(user);

	useEffect(() => {
		setRenderUser(user); // Update state when user changes
	}, [user]);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	return (
		<nav className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-white">
			<ul className="flex space-x-6">
				<li>
					<Link href="/">Home</Link>
				</li>
				{renderUser ? (
					<>
						<li>
							<button onClick={handleLogout} className="text-red-500">
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
