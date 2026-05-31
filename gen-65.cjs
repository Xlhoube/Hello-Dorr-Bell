const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
const pubBuffer = Buffer.from(keys.publicKey.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

console.log('Public Key (B64):', keys.publicKey);
console.log('Private Key (B64):', keys.privateKey);
console.log('Byte Length:', pubBuffer.length);
console.log('Bytes:', JSON.stringify(Array.from(pubBuffer)));

if (pubBuffer.length !== 65) {
  console.error('ERROR: Public key is not 65 bytes!');
  process.exit(1);
}
