const axios = require('axios');
const config = require('../config/config.js')

// Fungsi untuk mendapatkan informasi geolokasi dari alamat atau tempat tertentu
async function getGeolocation(address) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: config.api.key,
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else if (response.data.status === 'ZERO_RESULTS') {
      const location = {
        lat: 0,
        lng: 0
      }
      return location
    } else {
      throw new Error('No geolocation data found for the given address');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
}

module.exports = {
  getGeolocation,
};