const { Client } = require('pg');
require('dotenv').config();

const regions = [
  'ap-south-1',     // Mumbai (most likely for timezone +05:30)
  'ap-southeast-1', // Singapore
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'sa-east-1',      // São Paulo
  'ca-central-1'    // Canada
];

const password = 'Databaseabhi@019';
const encodedPassword = encodeURIComponent(password);
const tenant = 'dwkfefezsdgimhubusrl';

async function testHost(host, region) {
  const url = `postgresql://postgres.${tenant}:${encodedPassword}@${host}:5432/postgres?sslmode=no-verify`;
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`\n\n🎉 SUCCESS! Connected to host: ${host} (region: ${region})`);
    console.log(`Your correct DATABASE_URL is: postgresql://postgres.${tenant}:[PASSWORD]@${host}:5432/postgres?sslmode=no-verify`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('tenant/user') && err.message.includes('not found')) {
      process.stdout.write('.');
    } else {
      console.log(`\nHost ${host} failed with error:`, err.message);
    }
    return false;
  }
}

async function run() {
  console.log(`Scanning all pooler hosts for Supabase project ${tenant}...`);
  for (const region of regions) {
    const hostWith0 = `aws-0-${region}.pooler.supabase.com`;
    const hostWithout0 = `aws-${region}.pooler.supabase.com`;
    
    let success = await testHost(hostWith0, region);
    if (success) process.exit(0);
    
    success = await testHost(hostWithout0, region);
    if (success) process.exit(0);
  }
  console.log('\n\n❌ Could not find the correct region host. Please verify if the tenant ID is correct or if the database password is valid.');
}

run();
