import { PartialType } from '@nestjs/mapped-types';
import { CreateBaralhoDTO } from './create-baralho.dto.js';

export class UpdateBaralhoDTO extends PartialType(CreateBaralhoDTO) {}
