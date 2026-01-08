import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology:true,
        })

        console.log(" Mogno DB connected");
    }catch(e){
        console.error(`Mongo DB connection failed`,e.message)
    }
}