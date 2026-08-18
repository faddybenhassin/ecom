import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { connectDB, disconnectDB } from '../db';
import User from '../models/User';


describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await disconnectDB();
    });


    describe('POST /api/auth/register', async () =>{
        it('should register new user and return 201', async() => {
            const agent = request.agent(app);

            const NewUser = {
                email: 'test@example.com',
                password: 'testpassword',
                name: 'Test User'
            }
            const res = await agent
                            .post('/api/auth/register')
                            .send(NewUser)
                            .expect(201)

            expect(res.body.user).toMatchObject({
                name: NewUser.name,
                email: NewUser.email,
                id: expect.any(String),
                role: expect.any(String)
            });

            const authRes = await agent.get('/api/auth/me').expect(200);
            expect(authRes.body.user.email).toBe(NewUser.email);

            //check user exists in DB
            const user = await User.findById(res.body.user.id)
            expect(user).toBeDefined()
            expect(user.email).toBe(NewUser.email)
        })
    })

    describe('POST /api/auth/login', async () =>{

    })

    describe('POST /api/auth/logout', async () =>{

    })
    describe('PATCH /api/auth/users/:id/role', async () =>{

    })

    describe('GET /api/auth/me', async () =>{

    })
})