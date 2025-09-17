// this file will authenticate the user and check for user/admin

import type { Response, Request, NextFunction } from "express"
import jwt from "jsonwebtoken"
import prisma from "../db"


const JWT_SECRET = process.env.JWT_SECRET || "anypass"

interface AuthRequest extends Request {
    user?: { id: number, username: string, role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string }
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id,
                isActive: true
            },
            select: {
                id: true,
                username: true,
                role: true
            }
        })
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next()

    } catch (e) {
        res.status(401).json({ error: "Invalid Token" })
    }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Mf you are not an admin" })
        next();
    }
}

