import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcryptjs';
import { RegistrarDto } from './dto/registrar.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import { JwtService } from '@nestjs/jwt';

const CUSTO_HASH = 10; // Defina o custo do salt aqui ou via variáveis de ambiente

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistrarDto) {
    if (Buffer.from(dto.senha).length > 72) {
      throw new BadRequestException(
        'A senha deve ter no máximo 72 bytes em UTF-8',
      );
    }
    const senhaHash = await bcrypt.hash(dto.senha, CUSTO_HASH);

    try {
      const usuario = await this.prisma.usuario.create({
        // Quem se registra sozinho nunca vira ADMINISTRADOR — o schema
        // aplica estudante por padrão. Conceder o perfil administrativo é
        // decisão de quem já administra o sistema, não do próprio usuário;
        data: {
          nome: dto.nome,
          email: dto.email,
          senhaHash,
        },
      });

      // Omitimos o hash da resposta; novos campos sensíveis também devem
      // ser omitidos se forem acrescentados ao modelo.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senhaHash: _senhaHash, ...usuarioPublico } = usuario;
      return usuarioPublico;
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${dto.email} já cadastrado`);
      }
      throw erro;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // Proteção contra o limite de 72 bytes do bcrypt
    if (Buffer.from(dto.senha).length > 72) {
      throw new UnauthorizedException('email ou senha inválidos');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    // A MESMA exceção para "email não existe" e "senha errada" por segurança
    if (!usuario || !(await bcrypt.compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException('email ou senha inválidos');
    }

    // Usando 'perfil' conforme definido no Prisma Schema
    const payload = { sub: usuario.id, perfil: usuario.perfil };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
