import {AuthProvider} from "./context/AuthContext"; // Import AuthProvider
import {QueryProvider} from "./context/QueryProvider"; // Import QueryProvider
import {ThemeProvider} from "../components/theme-provider"; // Import ThemeProvider
import Navbar from "../components/Navbar"; // Import Navbar
import "./globals.css"; // Import global styles

export const metadata = {
	title: "Chat App",
	description: "A real-time chat application",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground transition-colors duration-200">
				<AuthProvider>
					<QueryProvider>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							{/* Navbar included here */}
							<Navbar />
							{/* Page content */}
							{children}
						</ThemeProvider>
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
