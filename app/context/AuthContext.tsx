"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from "react";

interface User {
	id: string;
	username: string;
	email: string;
}

interface AuthContextProps {
	user: User | null;
	login: (token: string, user: User) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		// On mount, check if user data is stored in localStorage
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const login = (token: string, user: User) => {
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(user));
		setUser(user);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
	};

	return <AuthContext.Provider value={{user, login, logout}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
