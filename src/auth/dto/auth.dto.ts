import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class AuthDTO {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}