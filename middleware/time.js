async function witaDateTime() {
  return new Promise((resolve, reject) => {
      // Membuat objek Date dari waktu saat ini
      var date = new Date();

      // Menentukan offset waktu WITA dari UTC (Waktu Indonesia Barat adalah UTC+8)
      var offsetWITA = 8;

      // Menambahkan offset WITA ke waktu saat ini
      date.setHours(date.getHours() + offsetWITA);

      // Mendapatkan komponen waktu dalam format ISO
      var formattedTime = date.toISOString();

      resolve(formattedTime);
  });
}

module.exports = { witaDateTime }
