const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { cleanDatabase, createTestUser } = require('./test.config');

chai.use(chaiHttp);
const expect = chai.expect;

describe('🔐 Authentication Routes', () => {

    beforeEach(async () => {
        await cleanDatabase();
    });

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user with valid credentials', async () => {
            const userData = {
                username: 'newuser',
                password: 'password123'
            };

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'User registered successfully');
            expect(res.body.data).to.have.property('token');
            expect(res.body.data.user).to.have.property('username', 'newuser');
            expect(res.body.data.user).to.not.have.property('password');
        });

        it('should fail registration with missing username', async () => {
            const userData = {
                password: 'password123'
            };

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('required');
        });

        it('should fail registration with missing password', async () => {
            const userData = {
                username: 'newuser'
            };

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('required');
        });

        it('should fail registration with an existing username', async () => {
            // Create a user first
            await createTestUser({ username: 'existinguser' });

            const userData = {
                username: 'existinguser',
                password: 'password123'
            };

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res).to.have.status(409);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('already exists');
        });

        it('should fail registration with short password', async () => {
            const userData = {
                username: 'newuser',
                password: '123'
            };

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await createTestUser({
                username: 'loginuser',
                password: 'password123'
            });
        });

        it('should successfully log in a registered user with correct credentials', async () => {
            const loginData = {
                username: 'loginuser',
                password: 'password123'
            };

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Login successful');
            expect(res.body.data).to.have.property('token');
            expect(res.body.data.user).to.have.property('username', 'loginuser');
            expect(res.body.data.user).to.not.have.property('password');
        });

        it('should fail login with incorrect username', async () => {
            const loginData = {
                username: 'wronguser',
                password: 'password123'
            };

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('Invalid credentials');
        });

        it('should fail login with incorrect password', async () => {
            const loginData = {
                username: 'loginuser',
                password: 'wrongpassword'
            };

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('Invalid credentials');
        });

        it('should fail login with missing credentials', async () => {
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({});

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('required');
        });
    });
});