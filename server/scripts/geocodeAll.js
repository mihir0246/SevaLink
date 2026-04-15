require('dotenv').config();
const mongoose = require('mongoose');
const Recipient = require('../models/Recipient');

async function geocodeAddress(city, address1) {
  if (!city) return null;
  const searchStr = `${address1 ? address1 + ', ' : ''}${city}`;
  try {
    const urlFull = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchStr)}`;
    let response = await fetch(urlFull, { headers: { 'User-Agent': 'SevaLink_Geocoding/1.0' } });
    
    if (response.ok) {
      let data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), long: parseFloat(data[0].lon) };
    }

    // Fallback: Try just the city if the exact address fails
    const urlCity = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`;
    response = await fetch(urlCity, { headers: { 'User-Agent': 'SevaLink_Geocoding/1.0' } });
    if (response.ok) {
      let data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), long: parseFloat(data[0].lon) };
    }

  } catch (err) {
    console.error('Backend Geocoding Error:', err.message);
  }
  return null;
}

// Ensure 1 request per second to respect Nominatim policy
const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find recipients that either don't have lat/long OR have exactly the same
    // fallback test coords if any (in this case, just missing is enough)
    const needsToGeocode = await Recipient.find({
      $or: [
        { lat: { $exists: false } },
        { lat: null },
        { long: { $exists: false } },
        { long: null }
      ]
    });

    console.log(`Found ${needsToGeocode.length} needs that require geocoding...`);

    let updatedCount = 0;
    for (const need of needsToGeocode) {
      console.log(`Geocoding: ${need.city} - ${need.address1}...`);
      const coords = await geocodeAddress(need.city, need.address1);
      
      if (coords) {
        need.lat = coords.lat;
        need.long = coords.long;
        await need.save();
        console.log(`-> Success: [${coords.lat}, ${coords.long}]`);
        updatedCount++;
      } else {
        console.log('-> FAILED to find coordinates.');
      }
      
      // Delay 1.2 seconds to be safe from rate limiting
      await delay(1200);
    }

    console.log(`\nGeocoding complete! Automatically updated ${updatedCount} records.`);
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
