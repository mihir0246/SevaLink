const express = require('express');
const router = express.Router();
const Recipient = require('../models/Recipient');
const VolunteerAction = require('../models/VolunteerAction');
const Volunteer = require('../models/Volunteer');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

/**
 * @route   GET /api/reports/summary
 * @desc    Aggregate data for the Admin Reports Dashboard
 * @access  Admin Only
 */
router.get('/summary', [auth, roleCheck('admin')], async (req, res) => {
  const { timeRange } = req.query; // '1day', '2days', 'week', 'month', 'year', 'all'

  let matchQuery = {};
  if (timeRange && timeRange !== 'all') {
    const startDate = new Date();
    switch (timeRange) {
      case '1day': startDate.setDate(startDate.getDate() - 1); break;
      case '2days': startDate.setDate(startDate.getDate() - 2); break;
      case 'week': startDate.setDate(startDate.getDate() - 7); break;
      case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
      case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
    }
    matchQuery = { createdAt: { $gte: startDate } };
  }

  try {
    // 1. Needs by Status
    const statusStats = await Recipient.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Needs by Urgency
    const urgencyStats = await Recipient.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // 3. Needs by Category (type)
    const categoryStats = await Recipient.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$needType', count: { $sum: 1 } } }
    ]);

    // 4. City/Area Impact
    const areaStats = await Recipient.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 5. Volunteer Stats
    const totalVolunteers = await Volunteer.countDocuments();
    const activeVolunteers = await Volunteer.countDocuments({ active: true });

    // 6. Real Trends (Last 6 Weeks)
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - (6 * 7));

    const realTrendsRaw = await Recipient.aggregate([
      { $match: { createdAt: { $gte: sixWeeksAgo } } },
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          needs: { $sum: 1 },
          fulfilled: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      { $limit: 6 }
    ]);

    const trends = [];
    const now = new Date();

    // Create base 6 weeks (this week and last 5)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));
      const weekNum = getWeekNumber(d);

      const realData = realTrendsRaw.find(t => t._id.week === weekNum);
      trends.push({
        month: `Week ${weekNum}`,
        needs: realData ? realData.needs : 0,
        fulfilled: realData ? realData.fulfilled : 0
      });
    }

    // Helper to get week number
    function getWeekNumber(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    }

    res.json({
      needsByStatus: statusStats.map(s => ({ name: s._id, value: s.count })),
      needsByUrgency: urgencyStats.map(s => ({ name: s._id, value: s.count })),
      needsByCategory: categoryStats.map(s => ({ name: s._id, value: s.count })),
      areaImpact: areaStats.map(s => ({ area: s._id || 'Unknown', count: s.count })),
      volunteerSummary: { total: totalVolunteers, active: activeVolunteers },
      trends
    });
  } catch (err) {
    console.error('Reports API Error:', err.message);
    res.status(500).json({ msg: 'Error generating reports' });
  }
});

/**
 * @route   GET /api/reports/ai-summary
 * @desc    Generate a text impact analysis using Gemini
 * @access  Admin Only
 */
router.get('/ai-summary', [auth, roleCheck('admin')], async (req, res) => {
  try {
    if (!config.geminiApiKey) {
      console.error('AI Error: GEMINI_API_KEY is missing');
      return res.status(500).json({ msg: 'Gemini API key not configured' });
    }

    // Fetch snapshot of current stats
    const totalNeeds = (await Recipient.countDocuments()) || 0;
    const urgentNeeds = (await Recipient.countDocuments({ urgency: { $in: ['high', 'critical', 'High', 'Critical'] } })) || 0;
    const resolvedNeeds = (await Recipient.countDocuments({ status: 'completed' })) || 0;
    const citiesRaw = await Recipient.distinct('city');
    const cities = citiesRaw.filter(c => c).join(', ') || 'Various Regions';

    console.log(`Generating AI Summary with: ${totalNeeds} needs, ${urgentNeeds} urgent, ${resolvedNeeds} resolved`);

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);

    const prompt = `
      You are an Impact Analyst for SevaLink, a social aid platform. 
      Analyze the following community data and provide a high-level summary (3-4 concise paragraphs) for a board meeting.
      
      CURRENT SNAPSHOT:
      - Total Registered Needs: ${totalNeeds}
      - High/Critical Urgency Needs: ${urgentNeeds}
      - Successfully Resolved: ${resolvedNeeds}
      - Regions Covered: ${cities}
      
      Focus on building a narrative of community resilience, pinpointing areas where more volunteers are needed, 
      and celebrating the efficiency of resolved needs. Keep it professional, empathetic, and data-driven.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    if (!summary) throw new Error('AI returned an empty summary');

    res.json({ summary });
  } catch (err) {
    console.error('AI Summary Route Error:', err);
    res.status(500).json({
      msg: 'Error generating AI summary',
      details: err.message
    });
  }
});

module.exports = router;
