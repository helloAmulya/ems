import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"

import authRoutes from "./routes/auth"
import eventRoutes from "./routes/events"
import registrations from "./routes/registrations"


dotenv.config();

const app = express();
