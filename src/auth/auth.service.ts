import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import { sha256 } from "src/crypto/sha256";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    private hashPassword(password: string): string {
        return sha256('salt$' + password);
    }

    async signUp(dto: AuthDTO) {

        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: {
                    equals: dto.email
                }
            }
        });

        if (existingUser) {
            throw new ForbiddenException('Email already taken');
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: this.hashPassword(dto.password)
            }
        });

        return this.signToken(user.id);
    }

    async signIn(dto: AuthDTO) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
            throw new ForbiddenException('Incorrect credentials');
        }

        return this.signToken(user.id);

    }



    async signToken(userId: number): Promise<{ access_token: string }> {

        const payload = {
            sub: userId
        }

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '30m',
            secret: this.config.get('JWT_SECRET')
        });

        return {
            access_token: token
        }

    }


}