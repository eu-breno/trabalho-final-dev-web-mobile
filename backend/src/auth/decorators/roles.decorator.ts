import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../../../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Perfil[]) => SetMetadata(ROLES_KEY, Perfil);