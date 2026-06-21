const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection with URL:', connectionString.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
  connectionString
});

client.connect()
  .then(() => {
    console.log('Successfully connected to Supabase Database!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('Connection error details:', err);
    process.exit(1);
  });
