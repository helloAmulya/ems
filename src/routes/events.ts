import express, { type Request, type Response } from "express";
import prisma from "../db";
import { isAdmin, authenticate } from "../middleware/auth";


const router = express.Router()

interface EventData {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number
}


const ValidateData = (data: EventData) => {
    const { title, description, date, time, location, capacity } = data;
    if (!title || !date || !time || !location || !capacity || capacity <= 0) {
        throw new Error("Invalid Event Data");
    }

    const eventDateTime = new Date(`${date}T${time}Z`)
    const currenTime = new Date()
    if (eventDateTime <= currenTime) {
        throw new Error("Event date must be in the future")
    }
};


router.post('/', authenticate, async (req: Request & { user?: { id: number } }, res: Response) => {
    try {
        ValidateData(req.body);
        const { title, description, date, time, location, capacity } = req.body;
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(`${date}T${time}Z`),
                location,
                capacity,
                creatorId: req.user!.id,
            },
        });
        res.status(201).json(event);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


router.put("/:id", authenticate, async (req: Request & { user?: { id: number; role: string } }, res: Response) => {

    const { id } = req.params;
    try {
        ValidateData(req.body);
        const { title, description, date, time, location, capacity } = req.body;
        const event = await prisma.event.findUnique({
            where: {
                id: Number(id)
            }
        });


        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (capacity < event.currentRegistrations) {
            return res.status(400).json({ error: "Capacity cannot be less than current registrations" });
        }
        if (event.creatorId !== req.user!.id && req.user!.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const updatedEvent = await prisma.event.update({
            where: {
                id: Number(id)
            },
            data: {
                title,
                description,
                date: new Date(`${date}T${time}Z`),
                capacity,
                location,
            }
        })
        res.json(updatedEvent);
    } catch (err: any) {
        res.status(400).json({ error: err.message })
    }
})



router.delete("/:id", authenticate, async (req: Request & { user?: { id: number; role: string } }, res: Response) => {

    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: {
                id: Number(id)
            }
        });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (event.creatorId !== req.user!.id && req.user!.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma.event.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({ message: "Event deleted successfully" })
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})


router.put("/:id/approve", authenticate, isAdmin, async (req: Request, res: Response) => {

    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid Status" });
    }

    try {
        const event = await prisma.event.update({
            where: { id: Number(id) },
            data: { status: status as "approved" | "rejected" },
        });
        res.json(event)
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})



router.get("/", async (req: Request, res: Response) => {

    const { date, location } = req.query;
    try {
        const events = await prisma.event.findMany({
            where: {
                status: 'approved',
                ...(date && {
                    date: {
                        gte: new Date(`${date}T00:00:00.000Z`),
                        lt: new Date(`${date}T23:59:59.999Z`),
                    },
                }),
                ...(location && { location: { contains: location as string, mode: 'insensitive' } }),
            },
            orderBy: [{ date: 'asc' }],
            include: {
                _count: {
                    select: { registrations: true },
                },
            },
        });

        res.json(events);
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})




export default router;