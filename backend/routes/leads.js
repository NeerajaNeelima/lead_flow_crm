// const express = require("express");
import express from 'express'
const router = express.Router();
//const { CreateLead,AddActivities,getLeads } = require("../controllers/leads");
import { CreateLead,AddActivities,getLeads,getLeadById,updateLeadStatus } from '../controllers/leads.js';

router.post("/create", CreateLead);
router.get("/leads",getLeads)
router.post("/activity",AddActivities);
router.get("/:id", getLeadById);
router.patch("/:id/status", updateLeadStatus);

//module.exports = router;

export default router;
