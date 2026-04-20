const crypto = require('crypto');
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 29000, 32, 'sha256', (err, derivedBits) => {
      if (err) reject(err);
      const saltB64 = salt.toString('base64');
      const hashB64 = derivedBits.toString('base64');
      resolve(`$pbkdf2-sha256$29000$${saltB64}$${hashB64}`);
    });
  });
}
hashPassword('cliente123').then(console.log);
