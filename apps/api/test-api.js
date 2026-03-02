const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_USER_ID = '58f6b8e7-ddf0-4d41-9c0e-9cd16e5fb90c';

console.log(
  'Loaded SUPABASE_URL prefix:',
  SUPABASE_URL ? SUPABASE_URL.slice(0, 10) : 'undefined'
);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

async function readResponse(response) {
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body,
  };
}

function printResult(label, result) {
  console.log(`\n=== ${label} ===`);
  console.log('Status:', result.status, result.statusText);
  console.log('Headers:', result.headers);
  console.log('Body:', JSON.stringify(result.body, null, 2));
}

async function callApi(label, accessToken, method, pathName, payload) {
  const response = await fetch(`${API_BASE_URL}${pathName}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const result = await readResponse(response);
  printResult(label, result);

  if (!response.ok) {
    throw new Error(
      `${label} failed with ${result.status} ${result.statusText}: ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
}

async function cleanupExistingTenantUser(supabaseAdmin, email) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const users = data?.users ?? [];
  const existingUser = users.find(
    (user) => (user.email || '').toLowerCase() === email.toLowerCase()
  );

  if (!existingUser) {
    console.log(`No existing auth user found for ${email}.`);
    return;
  }

  console.log(`Existing auth user found for ${email}: ${existingUser.id}. Cleaning up...`);

  const { error: tenantDeleteError } = await supabaseAdmin
    .from('tenants')
    .delete()
    .eq('user_id', existingUser.id);

  if (tenantDeleteError) {
    throw new Error(`Failed to delete tenant record(s): ${tenantDeleteError.message}`);
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  if (authDeleteError) {
    throw new Error(`Failed to delete existing auth user: ${authDeleteError.message}`);
  }

  console.log(`Deleted existing tenant and auth user for ${email}.`);
}

async function main() {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: passwordResetError } = await supabaseAdmin.auth.admin.updateUserById(
    ADMIN_USER_ID,
    { password: 'Admin1234!' }
  );

  if (passwordResetError) {
    throw new Error(`Failed to reset user password: ${passwordResetError.message}`);
  }

  console.log('Password reset complete for test admin user.');

  const signInUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

  const signInResponse = await fetch(signInUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'Admin1234!',
    }),
  });

  const signInResult = await readResponse(signInResponse);
  printResult('Supabase Sign-In Response', signInResult);

  if (!signInResponse.ok) {
    throw new Error(
      `Sign-in failed with ${signInResult.status} ${signInResult.statusText}: ${JSON.stringify(signInResult.body)}`
    );
  }

  const accessToken = signInResult.body.access_token;
  if (!accessToken) {
    throw new Error('No access_token returned from Supabase sign-in');
  }

  const propertyBody = await callApi(
    'Step 1 - POST /api/properties',
    accessToken,
    'POST',
    '/api/properties',
    {
      name: 'Test Building',
      address_line_1: '123 Main Street',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      country: 'Ethiopia',
      postal_code: '1000',
    }
  );
  const propertyId = propertyBody?.data?.id;
  if (!propertyId) {
    throw new Error('Step 1 did not return property id');
  }

  const unitBody = await callApi(
    'Step 2 - POST /api/properties/{property_id}/units',
    accessToken,
    'POST',
    `/api/properties/${propertyId}/units`,
    {
      unit_code: '101',
      bedrooms: 2,
      bathrooms: 1,
      monthly_rent: 5000,
      is_occupied: false,
    }
  );
  const unitId = unitBody?.data?.id;
  if (!unitId) {
    throw new Error('Step 2 did not return unit id');
  }

  await cleanupExistingTenantUser(supabaseAdmin, 'tenant@test.com');

  const tenantBody = await callApi(
    'Step 3 - POST /api/tenants',
    accessToken,
    'POST',
    '/api/tenants',
    {
      email: 'tenant@test.com',
      password: 'Tenant1234!',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+251911234567',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '+251917654321',
    }
  );
  const tenantId = tenantBody?.data?.id;
  if (!tenantId) {
    throw new Error('Step 3 did not return tenant id');
  }

  const leaseBody = await callApi(
    'Step 4 - POST /api/leases',
    accessToken,
    'POST',
    '/api/leases',
    {
      tenant_id: tenantId,
      unit_id: unitId,
      property_id: propertyId,
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      monthly_rent: 5000,
      security_deposit: 10000,
    }
  );
  const leaseId = leaseBody?.data?.id;
  if (!leaseId) {
    throw new Error('Step 4 did not return lease id');
  }

  await callApi(
    'Step 5 - POST /api/invoices',
    accessToken,
    'POST',
    '/api/invoices',
    {
      lease_id: leaseId,
      issue_date: '2024-01-01T00:00:00.000Z',
      due_date: '2024-01-31T00:00:00.000Z',
      items: [
        {
          description: 'Monthly Rent - January 2024',
          quantity: 1,
          unit_price: 5000,
          line_total: 5000,
        },
      ],
    }
  );

  console.log('\nAll steps completed successfully.');
}

main().catch((error) => {
  console.error('\nScript failed:', error);
  process.exit(1);
});
