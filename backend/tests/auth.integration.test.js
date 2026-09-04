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

        it('should hash password and not expose it', async()=>{
            const agent = request.agent(app);

            const res = await agent
                            .post('/api/auth/register')
                            .send({
                                email: 'test@example.com',
                                password: 'testpassword',
                                name: 'Test User'
                            });

            expect(res.status).toBe(201);

            // Verify in DB
            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeDefined();
            expect(user.auth_methods.local.password_hash).toBeDefined();
            expect(user.auth_methods.local.password_hash).not.toBe('testpassword');
            
            // Verify hash is valid
            const isValid = await bcrypt.compare('SecurePass123!', user.auth_methods.local.password_hash);
            expect(isValid).toBe(true);
        })

        it('should register user with valid credentials',async ()=>{
            const agent = request.agent(app);

            const res = await agent
                            .post('/api/auth/register')
                            .send({
                                email: 'test@example.com',
                                password: 'testpassword',
                                name: 'Test User'
                            });

            expect(res.status).toBe(201);
            expect(res.body.message).toContain('successfuly');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.user.name).toBe('John Doe');

        })

        it('should create user with correct auth_methods structure',async()=>{
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

            const user = await User.findOne({ email: NewUser.email });
            expect(user.auth_methods).toHaveProperty('local');
            expect(user.auth_methods).toHaveProperty('oidc');
            expect(user.auth_methods.local).toHaveProperty('password_hash');
            expect(Array.isArray(user.auth_methods.oidc)).toBe(true);
        })

        it('should return default role', async()=>{
            const agent = request.agent(app);

            const res = await agent
                            .post('/api/auth/register')
                            .send({
                                email: 'test@example.com',
                                password: 'testpassword',
                                name: 'Test User'
                            });

            expect(res.status).toBe(201);
            expect(res.body.user).toHaveProperty('role');
            expect(res.body.user.role).toBe('user');
        })

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