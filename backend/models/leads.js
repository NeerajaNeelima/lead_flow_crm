// const mongoose = require("mongoose");
import mongoose from "mongoose";

const activitiesSchema = new mongoose.Schema({
    type:{
        type:String,
    },
    description:{
        type:String,
    },
    timestamp:{
        type:Date,
        default:Date.now,
    },
    
})

const leadSchema = new mongoose.Schema({
    firstName:{
        type:String,
    },
    companyName:{
        type:String,
    },
    email:{
        type:String,
    },
    source:{
        type:String,
    },
    note:{
        type:String,
    },
    activities:{
      type:[activitiesSchema],
      default:[]
    },
    status: {
        type: String,
        enum: ["New", "Contacted", "Qualified"],
        default: "New",
      }
      
},
{
    timestamps:true
}
);

export default mongoose.model('Lead',leadSchema);