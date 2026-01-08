import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
// const leadRoutes = require('./routes/leads.js')
import leadRoutes from './routes/leads.js'

const app=express();

app.use(
    cors({
        origin:[
            'http://localhost:3000','https://lead-flow-crm-delta.vercel.app',
        ],
        methods:["GET","POST","PUT","PATCH"]
    })
)

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL,{})
        console.log(" Mogno DB connected");
    }catch(e){
        console.error(`Mongo DB connection failed`,e.message)
    }
}

connectDB();
app.use(express.json());

app.use('/api/lead',leadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server listening at port ${PORT}`)
});