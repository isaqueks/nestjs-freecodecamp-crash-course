import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import * as pactum from 'pactum';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "src/auth/dto";

describe('App e2e', () => {

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true
            })
        );

        await app.init();
        await app.listen(3339);

        const prisma = app.get(PrismaService);
        prisma.cleanDb();

        pactum.request.setBaseUrl('http://localhost:3339');
    });

    afterAll(async () => {
        return app.close();
    })

    describe('Auth', () => {

        const dto: AuthDTO = {
            email: 'foo@bar.net',
            password: 'foobar123'
        }

        describe('SignUp', () => {

            it('should throw when email is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signUp')
                    .withBody({
                        email: '',
                        password: dto.password
                    })
                    .expectStatus(400)
            });

            it('should throw when password is empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signUp')
                    .withBody({
                        email: dto.email,
                    })
                    .expectStatus(400)
            });

            it('should sign up', () => {
                return pactum
                    .spec()
                    .post('/auth/signUp')
                    .withBody(dto)
                    .expectStatus(201)
            });
        });

        describe('SignIn', () => {
            it('should sign in', () => {
                return pactum
                    .spec()
                    .post('/auth/signIn')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('userAt', 'access_token')
            });
        });
    });

    describe('User', () => {

        describe('Get me', () => {

            it('Should get current user', () => {

                return pactum
                .spec()
                .get('/users/me')
                .withHeaders({
                    Authorization: 'Bearer $S{userAt}'
                })
                .expectStatus(200)

            });

        });

    });

    describe('Bookmarks', () => {

    });

});