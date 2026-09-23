import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateRevisaoDTO {
  @IsInt()
  @Min(1, { message: 'A nota mínima de avaliação é 1' })
  @Max(5, { message: 'A nota máxima de avaliação é 5' })
  @IsNotEmpty()
  nota: number;
}
