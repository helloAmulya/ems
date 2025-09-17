import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.ts';
import eventRoutes from './routes/events.ts';
import registrationsRoutes from './routes/registrations.ts';



dotenv.config();

const app = express();
const date = new Date;
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/register", registrationsRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "OK", date: new Date().toISOString() })
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
    console.log(`Current date/time (IST) : ${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
})
