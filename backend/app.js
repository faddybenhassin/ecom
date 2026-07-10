import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js'
import productRouter from './routes/products.js'
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
app.use('/', productRouter)


app.get('/auth/me',(req,res)=>{
  if (!req.session.user) return res.status(401).send('Unauthorized');
  res.json(req.session.user);
})

app.get('/hello',protect, adminOnly,(req,res)=>{
    res.json("hello")
})

// app.get('/',(req,res)=>{
//     res.send('<a href="/auth/google">Login with Google</a>');
// })

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})