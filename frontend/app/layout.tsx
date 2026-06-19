import {AuthProvider} from "./context/AuthContext"; // Import AuthProvider
import Navbar from "../components/Navbar"; // Import Navbar
import "./globals.css"; // Import global styles

export const metadata = {
	title: "Chat App",
	description: "A real-time chat application",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<body>
				<AuthProvider>
					{/* Navbar included here */}
					<Navbar />
					{/* Page content */}
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
