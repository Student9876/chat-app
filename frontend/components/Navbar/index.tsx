"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {useAuth} from "../../app/context/AuthContext";
import {useRouter} from "next/navigation";
import Image from "next/image";

import user_logo from "./icons/user.png";

const Navbar = () => {
	const {user, logout} = useAuth();
	const router = useRouter();

	const [renderUser, setRenderUser] = useState(user);
	const [isDropdownVisible, setDropdownVisible] = useState(false);

	useEffect(() => {
		setRenderUser(user);
	}, [user]);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	return (
		<nav className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-white">
			<ul className="flex space-x-6 relative">
				{renderUser && (
					<li className="relative">
						<div
							className="h-[30px] w-[30px] flex justify-center items-center cursor-pointer"
							onClick={() => setDropdownVisible(!isDropdownVisible)}>
							<Image src={user_logo} width={30} height={30} alt={"user logo"} />
						</div>
						{isDropdownVisible && (
							<div className="absolute top-full mt-2 left-0 border-[1px] border-slate-400 bg-white text-black rounded shadow-lg p-4 w-56 transition-transform transform scale-100 z-20">
								<p className="font-semibold">Username: {user?.username || "Guest"}</p>
								<p>Email: {user?.email || "N/A"}</p>
								<button onClick={handleLogout} className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded">
									Logout
								</button>
							</div>
						)}
					</li>
				)}
				<li className="flex justify-center items-center text-[18px]">
					<Link href="/">Home</Link>
				</li>
				{renderUser ? null : (
					<>
						<li className="flex justify-center items-center text-[18px]">
							<Link href="/login">Login</Link>
						</li>
						<li className="flex justify-center items-center text-[18px]">
							<Link href="/register">Register</Link>
						</li>
					</>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
