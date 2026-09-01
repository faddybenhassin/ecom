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


    describe('POST /auth/register', async () =>{
        it('should register new user, return 201 and create session', async() => {
            const agent = request.agent(app);

            const NewUser = {
                email: 'test@example.com',
                password: 'testpassword',
                name: 'Test User'
            }
            const res = await agent
                            .post('/auth/register')
                            .send(NewUser)
                            .expect(201)

            expect(res.body.user).toMatchObject({
                name: NewUser.name,
                email: NewUser.email,
                id: expect.any(String),
                role: expect.any(String)
            });

            // check session
            const authRes = await agent.get('/auth/me').expect(200);
            expect(authRes.body.user).toMatchObject({
                name: NewUser.name,
                email: NewUser.email,
                id: expect.any(String),
                role: expect.any(String)
            });
            
            //check user exists in DB
            const user = await User.findById(res.body.user.id)
            expect(user).toBeDefined()
            expect(user.email).toBe(NewUser.email)
        })

        it("should show error on duplicate email", async()=>{
            //  create user manually   
            await User.create({
                email: 'test@example.com',
                name: 'Existing User',
                auth_methods: {
                    local: { password_hash: 'hashed' },
                    oidc: []
                }
            });
            const agent = request.agent(app);

            const User = {
                email: 'test@example.com',
                password: 'testpassword',
                name: 'Test User'
            }
            const res = await agent
                            .post('/auth/register')
                            .send(User)

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('already taken');
            
        })

        it('should hash password and not expose it')
        it('should register user with valid credentials')
        it('should create user with correct auth_methods structure')
        it('should return default role')

        it('should reject missing email', async ()=>{
            const agent = request.agent(app);

            const NewUser = {
                password: 'testpassword',
                name: 'Test User'
            }

            const res = await agent
                            .post('/auth/register')
                            .send(NewUser)

            expect(res.status).toBeGreaterThanOrEqual(400);
        })
        it('should reject missing password', async ()=>{
            const agent = request.agent(app);

            const NewUser = {
                email: 'test@example.com',
                name: 'Test User'
            }

            const res = await agent
                            .post('/auth/register')
                            .send(NewUser)

            expect(res.status).toBeGreaterThanOrEqual(400);
        })
        it('should reject missing name', async ()=>{
            const agent = request.agent(app);

            const NewUser = {
                email: 'test@example.com',
                password: 'testpassword',
            }

            const res = await agent
                            .post('/auth/register')
                            .send(NewUser)

            expect(res.status).toBeGreaterThanOrEqual(400);
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