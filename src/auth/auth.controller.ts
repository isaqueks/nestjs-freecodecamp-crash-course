import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";


@Controller('auth')
export class AuthController {

    constructor(
        private service: AuthService
    ) {}

    @Post('signUp')
    async signUp(@Body() dto: AuthDTO) {
        return await this.service.signUp(dto);
    }

    @HttpCode(200)
    @Post('signIn')
    async signIn(@Body() dto: AuthDTO) {
        return await this.service.signIn(dto);
    }

}