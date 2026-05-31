const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const pubBytes = [
    4, 129, 213, 132, 145, 163, 91, 249, 64, 126, 110, 157, 208, 8, 119, 181, 
    124, 184, 104, 250, 36, 171, 89, 28, 106, 255, 216, 68, 158, 208, 194, 105, 
    113, 190, 84, 1, 229, 243, 199, 236, 83, 80, 26, 191, 211, 80, 220, 238, 
    73, 169, 176, 45, 71, 182, 202, 136, 182, 107, 211, 212, 48, 243, 38, 219, 48
];

console.log("Public B64URL:", base64url(Buffer.from(pubBytes)));
