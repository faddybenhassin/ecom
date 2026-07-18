import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import authRouter from './routes/auth.route.js'
import productRouter from './routes/product.route.js'
import variantRouter from './routes/variant.route.js'
import categoryRouter from './routes/category.route.js'
import reviewRouter from './routes/review.route.js'
import cors from 'cors';
import { adminOnly, protect } from './middleware/auth.js';

dotenv.config()


connectDB();
const app = express()
const PORT = process.env.PORT || 3000;


app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    secure: false, 
    sameSite: 'lax' 
  }
}))

app.use('/auth', authRouter)
app.use('/api', productRouter)
app.use('/api', variantRouter)
app.use('/api', categoryRouter)
app.use('/api', reviewRouter)


app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})