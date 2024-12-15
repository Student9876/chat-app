"use client";

import {useEffect} from "react";
import {useAuth} from "../context/AuthContext";
import {useRouter} from "next/navigation";

const Dashboard = () => {
	const {user} = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Redirect to login if user is not authenticated
		if (!user) {
			router.push("/login");
		}
	}, [user, router]);

	if (!user) return null; // Optionally display a loading spinner

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold">Welcome to your Dashboard, {user.username}</h1>
		</div>
	);
};

export default Dashboard;
