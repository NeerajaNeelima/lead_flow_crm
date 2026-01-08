// const Lead = require('../models/leads')

import Lead from '../models/leads.js'

export const getLeads = async(req,res,next)=>{
    try{
      const leads = await Lead.find();
      res.status(200).json({
        success:true,
        data:leads
      })
    }catch(e){
        next(e)
    }
}

export const CreateLead = async(req,res,next)=>{
try{
    const{firstName,companyName,email,source,note}=req.body;
    const lead = await Lead.create({
        firstName,
        companyName,
        email,
        source,
        note
    })
    res.status(201).json({
        success:true,
        message:"Lead created",
        data:lead,
    })

}catch(e){
    next(e);
}
}

export const AddActivities = async(req,res,next) =>{
    try {
        const { id, type, description } = req.body;
    
        if (!id || !type || !description) {
          return res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }
    
        const lead = await Lead.findById(id);
    
        if (!lead) {
          return res.status(404).json({
            success: false,
            message: "Lead not found",
          });
        }
    
        lead.activities.push({
          type,
          description,
          timestamp: new Date(),
        });
    
        await lead.save();
    
        res.status(200).json({
          success: true,
          message: "Activity added successfully",
          data: lead.activities,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
}

export const getLeadById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const lead = await Lead.findById(id);
  
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }
  
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const updateLeadStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("id ==>",id)
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }
  
      const lead = await Lead.findById(id);
  
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }
  
      lead.status = status;
      await lead.save();
  
      res.status(200).json({
        success: true,
        message: "Lead status updated successfully",
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };