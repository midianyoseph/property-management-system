import { UserRole } from '@property-management/types';
import { supabaseAdmin } from '../lib/supabase';

type HttpError = Error & { statusCode: number };

type CreateTenantPayload = {
  email: string;
  password: string;
  full_name?: string;
  primary_phone: string;
  secondary_phone?: string;
  date_of_birth?: string;
};

type UpdateTenantProfilePayload = {
  primary_phone?: string;
  secondary_phone?: string;
  date_of_birth?: string;
};

function createHttpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function getAllTenants(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('tenants')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    throw createHttpError(500, error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getTenantById(id: string) {
  const { data: tenant, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
  }

  if (!tenant) {
    throw createHttpError(404, 'Tenant not found');
  }

  let currentUnit: Record<string, unknown> | null = null;
  if (tenant.current_unit_id) {
    const { data: unit, error: unitError } = await supabaseAdmin
      .from('units')
      .select('*')
      .eq('id', tenant.current_unit_id)
      .maybeSingle();

    if (unitError) {
      throw createHttpError(500, unitError.message);
    }

    currentUnit = unit ?? null;
  }

  const { data: activeLeases, error: leaseError } = await supabaseAdmin
    .from('leases')
    .select('*')
    .eq('tenant_id', id)
    .eq('status', 'ACTIVE')
    .order('start_date', { ascending: false })
    .limit(1);

  if (leaseError) {
    throw createHttpError(500, leaseError.message);
  }

  return {
    ...tenant,
    current_unit: currentUnit,
    active_lease: activeLeases?.[0] ?? null,
  };
}

export async function createTenant(data: CreateTenantPayload) {
  let createdAuthUserId: string | null = null;

  try {
    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
      },
      app_metadata: {
        role: UserRole.TENANT,
      },
    });

    if (authError || !authResult.user) {
      throw createHttpError(500, authError?.message ?? 'Failed to create auth user');
    }

    createdAuthUserId = authResult.user.id;

    const tenantPayload = removeUndefined({
      user_id: createdAuthUserId,
      primary_phone: data.primary_phone,
      secondary_phone: data.secondary_phone,
      date_of_birth: data.date_of_birth,
    });

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert(tenantPayload)
      .select('*')
      .single();

    if (tenantError) {
      throw createHttpError(500, tenantError.message);
    }

    return tenant;
  } catch (error) {
    if (createdAuthUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
    }

    throw error;
  }
}

export async function updateTenantProfile(tenantId: string, data: UpdateTenantProfilePayload) {
  const updatePayload = removeUndefined(data);

  if (Object.keys(updatePayload).length === 0) {
    throw createHttpError(400, 'At least one profile field must be provided');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('tenants')
    .update(updatePayload)
    .eq('id', tenantId)
    .select('*')
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
  }

  if (!updated) {
    throw createHttpError(404, 'Tenant not found');
  }

  return updated;
}
