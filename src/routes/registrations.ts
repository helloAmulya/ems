import express, { type Request, type Response } from "express";
import prisma from "../db";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post('/events/:id/register', authenticate, async (req: Request & { user?: { id: number } }, res: Response) => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: Number(id) },
        });

        if (!event || event.status !== "approved") {
            return res.status(404).json({ error: 'Event not found or not approved' });
        }

        if (event.currentRegistrations >= event.capacity) {
            return res.status(400).json({ error: "Event capacity reached" });
        }

        const registration = await prisma.registration.create({
            data: { eventId: Number(id), userId: req.user!.id },
        });

        await prisma.event.update({
            where: { id: Number(id) },
            data: { currentRegistrations: { increment: 1 } },
        });

        res.status(201).json({ message: "Successfully registered", registration });
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Already registered for this event" });
        }
        res.status(500).json({ error: err.message });
    }
});

router.delete("/events/:id/register", authenticate, async (req: Request & { user?: { id: number } }, res: Response) => {
    const { id } = req.params;
    try {
        const registration = await prisma.registration.deleteMany({
            where: { eventId: Number(id), userId: req.user!.id },
        });

        if (registration.count === 0) {
            return res.status(400).json({ error: "Not registered for this event" });
        }

        await prisma.event.update({
            where: { id: Number(id) },
            data: { currentRegistrations: { decrement: 1 } },
        });

        res.status(200).json({ message: "Registration deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
