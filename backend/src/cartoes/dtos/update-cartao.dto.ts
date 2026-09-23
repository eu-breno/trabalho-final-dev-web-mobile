import { PartialType } from '@nestjs/mapped-types';
import { CreateCartaoDTO } from './create-cartao.dto.js';

export class UpdateCartaoDTO extends PartialType(CreateCartaoDTO) {}
