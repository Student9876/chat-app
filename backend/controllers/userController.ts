import { Request, Response } from "express";
import User from "../models/User";


export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;
    console.log("Searching for users with query:", query);

    try {
        const users = await User.find({ email: { $regex: query, $options: "i" } });
        console.log("Found users:", users);
        res.status(200).json({ results: users });
        return;
    } catch (error) {
        console.error("Failed to search users:", error);
        res.status(500).json({ message: "Failed to search users" });
    }
}

