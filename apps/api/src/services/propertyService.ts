import { supabaseAdmin } from '../lib/supabase';

type PropertyPayload = {
  name?: string;
  description?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

type UnitPayload = {
  unit_code?: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  monthly_rent?: number;
  is_occupied?: boolean;
};

type HttpError = Error & { statusCode: number };

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

export async function getAllProperties(adminUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*, units(*)')
    .eq('created_by', adminUserId)
    .order('created_at', { ascending: false });

  if (error) {
    throw createHttpError(500, error.message);
  }

  return data ?? [];
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*, units(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
  }

  if (!data) {
    throw createHttpError(404, 'Property not found');
  }

  return data;
}

export async function createProperty(data: PropertyPayload, adminUserId: string) {
  const requiredFields: Array<keyof PropertyPayload> = [
    'name',
    'address_line_1',
    'city',
    'state',
    'postal_code',
    'country',
  ];

  for (const field of requiredFields) {
    const value = data[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw createHttpError(400, `Missing required field: ${field}`);
    }
  }

  const insertPayload = removeUndefined({
    ...data,
    created_by: adminUserId,
  });

  const { data: created, error } = await supabaseAdmin
    .from('properties')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw createHttpError(500, error.message);
  }

  return created;
}

export async function updateProperty(id: string, data: PropertyPayload) {
  const updatePayload = removeUndefined(data);

  if (Object.keys(updatePayload).length === 0) {
    throw createHttpError(400, 'At least one property field must be provided');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('properties')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
  }

  if (!updated) {
    throw createHttpError(404, 'Property not found');
  }

  return updated;
}

export async function createUnit(propertyId: string, data: UnitPayload) {
  const requiredFields: Array<keyof UnitPayload> = [
    'unit_code',
    'bedrooms',
    'bathrooms',
    'monthly_rent',
    'is_occupied',
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw createHttpError(400, `Missing required field: ${field}`);
    }
  }

  const { data: property, error: propertyError } = await supabaseAdmin
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .maybeSingle();

  if (propertyError) {
    throw createHttpError(500, propertyError.message);
  }

  if (!property) {
    throw createHttpError(404, 'Property not found');
  }

  const insertPayload = removeUndefined({
    property_id: propertyId,
    ...data,
  });

  const { data: created, error } = await supabaseAdmin
    .from('units')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw createHttpError(500, error.message);
  }

  return created;
}

export async function updateUnit(id: string, data: UnitPayload) {
  const updatePayload = removeUndefined(data);

  if (Object.keys(updatePayload).length === 0) {
    throw createHttpError(400, 'At least one unit field must be provided');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('units')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
  }

  if (!updated) {
    throw createHttpError(404, 'Unit not found');
  }

  return updated;
}
