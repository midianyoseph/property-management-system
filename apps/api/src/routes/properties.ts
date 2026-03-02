import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole } from '@property-management/types';
import { requireRole } from '../middleware/requireRole';
import {
  createProperty,
  createUnit,
  getAllProperties,
  getPropertyById,
  updateProperty,
  updateUnit,
} from '../services/propertyService';

const router = Router();
type HttpError = Error & { statusCode: number };

function validationError(message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = 400;
  return error;
}

function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw validationError(result.error.issues.map((issue) => issue.message).join(', '));
  }

  return result.data;
}

const idParamSchema = z.object({
  id: z.string().uuid('Invalid id parameter'),
});

const propertyBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  address_line_1: z.string().trim().min(1),
  address_line_2: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postal_code: z.string().trim().min(1),
  country: z.string().trim().min(1),
});

const propertyPatchSchema = propertyBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one property field must be provided'
);

const unitBodySchema = z.object({
  unit_code: z.string().trim().min(1),
  floor: z.number().int().optional(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  square_meters: z.number().positive().optional(),
  monthly_rent: z.number().nonnegative(),
  is_occupied: z.boolean(),
});

const unitPatchSchema = unitBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one unit field must be provided'
);

router.get('/properties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', status: 401 });
      return;
    }

    const properties = await getAllProperties(userId);
    res.json({ data: properties });
  } catch (error) {
    next(error);
  }
});

router.get('/properties/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = parseOrThrow(idParamSchema, req.params);
    const property = await getPropertyById(id);
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/properties',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = parseOrThrow(propertyBodySchema, req.body);
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', status: 401 });
        return;
      }

      const property = await createProperty(body, userId);
      res.status(201).json({ data: property });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/properties/:id',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parseOrThrow(idParamSchema, req.params);
      const body = parseOrThrow(propertyPatchSchema, req.body);
      const property = await updateProperty(id, body);
      res.json({ data: property });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/properties/:id/units',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parseOrThrow(idParamSchema, req.params);
      const body = parseOrThrow(unitBodySchema, req.body);
      const unit = await createUnit(id, body);
      res.status(201).json({ data: unit });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/units/:id',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parseOrThrow(idParamSchema, req.params);
      const body = parseOrThrow(unitPatchSchema, req.body);
      const unit = await updateUnit(id, body);
      res.json({ data: unit });
    } catch (error) {
      next(error);
    }
  }
);

export { router as propertiesRouter };
