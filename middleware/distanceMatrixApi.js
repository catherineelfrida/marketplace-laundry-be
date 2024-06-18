const axios = require('axios');
const config = require('../config/config.js')

// Fungsi untuk menghitung jarak dan waktu perjalanan
async function calculateDistance(origins, destinations) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: config.api.key,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Internal server error');
  }
}

module.exports = {
  calculateDistance,
};
