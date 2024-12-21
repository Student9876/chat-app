import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "abcd";

const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        // Save user to the database
        await newUser.save();

        // Generate JWT token
        const token = generateToken(String(newUser._id));

        res.status(201).json({
            message: 'User registered successfully',
            token, // Send the JWT token
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error('Error during registration:', error); // Log any error that occurs
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user: IUser | null = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = generateToken(String(user._id));
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token to be verified for authorization", token);
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
        res.status(200);
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
        console.log("User token invalid");
    }
};