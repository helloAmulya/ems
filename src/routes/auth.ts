import express, { type Request, type Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../db'

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "anypass";


router.post("/register", async (req: Request, res: Response) => {
    const { username, password, email, role = "user" } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: 'Username, password, and email required' })

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                role,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
        });
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(201).json({
            message: "User registered successfully",
            user,
            token,
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if ((!username) || !password) {
        return res.status(400).json({ error: "Username or email and password required" });
    }

    try {
        let user = null;
        // check username
        if (username) {
            user = await prisma.user.findUnique({ where: { username } })
        }
        // if no user found
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });


        return res.json({
            message: "Login successful",
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

})


export default router;