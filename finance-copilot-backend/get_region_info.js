const dns = require('dns');
const https = require('https');

console.log('Resolving DNS for dwkfefezsdgimhubusrl.supabase.co...');

dns.resolveAny('dwkfefezsdgimhubusrl.supabase.co', (err, addresses) => {
  if (err) {
    console.error('DNS resolveAny error:', err);
  } else {
    console.log('DNS records:', addresses);
  }
});

https.get('https://dwkfefezsdgimhubusrl.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3a2ZlZmV6c2RnaW1odWJ1c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Nzg4MTgsImV4cCI6MjA5NzU1NDgxOH0.-JlQq8BRDsMbS2s3vOsXrg8TNG37We1uZZ2SajpxaO8'
  }
}, (res) => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error('HTTP Error:', e);
});
