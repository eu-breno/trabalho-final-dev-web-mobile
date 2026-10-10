import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Perfil } from '../../../generated/prisma/enums.js';
import { UsuarioAutenticado } from '../tipos/usuario-autenticado.js';

// O payload que AuthService.login() assinou (ver auth.service.ts).
interface PayloadJwt {
  sub: string;
  perfil: Perfil;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // false é o padrão, mas explícito aqui: um token expirado deve ser
      // rejeitado, nunca aceito "só desta vez".
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Roda depois que a assinatura e a validade já foram conferidas pelo
  // passport-jwt. O retorno vira request.user — por isso ele já sai no
  // formato que o resto da aplicação consome (UsuarioAutenticado), e não
  // no formato bruto do payload.
  validate(payload: PayloadJwt): UsuarioAutenticado {
    return { id: payload.sub, papel: payload.perfil };
  }
}
