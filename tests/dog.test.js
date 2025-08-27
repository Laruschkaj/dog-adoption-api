const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { cleanDatabase, createTestUser, createTestDog } = require('./test.config');

chai.use(chaiHttp);
const expect = chai.expect;

// Helper function to generate JWT token for testing
const generateTestToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

describe('🐕 Dog Management Routes', () => {
    let testUser1, testUser2, token1, token2;

    beforeEach(async () => {
        await cleanDatabase();

        // Create two test users
        testUser1 = await createTestUser({
            username: 'dogowner1',
            password: 'password123'
        });

        testUser2 = await createTestUser({
            username: 'dogowner2',
            password: 'password456'
        });

        // Generate tokens for both users
        token1 = generateTestToken(testUser1);
        token2 = generateTestToken(testUser2);
    });

    describe('POST /api/dogs - Dog Registration', () => {
        it('should allow an authenticated user to register a new dog', async () => {
            const dogData = {
                name: 'Buddy',
                description: 'A friendly golden retriever'
            };

            const res = await chai.request(app)
                .post('/api/dogs')
                .set('Authorization', `Bearer ${token1}`)
                .send(dogData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Dog registered successfully');
            expect(res.body.data.dog).to.have.property('name', 'Buddy');
            expect(res.body.data.dog).to.have.property('status', 'available');
            expect(res.body.data.dog.owner).to.have.property('username', 'dogowner1');
        });

        it('should fail to register a dog without authentication', async () => {
            const dogData = {
                name: 'Buddy',
                description: 'A friendly golden retriever'
            };

            const res = await chai.request(app)
                .post('/api/dogs')
                .send(dogData);

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('Access denied');
        });

        it('should fail to register a dog with missing name', async () => {
            const dogData = {
                description: 'A friendly golden retriever'
            };

            const res = await chai.request(app)
                .post('/api/dogs')
                .set('Authorization', `Bearer ${token1}`)
                .send(dogData);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('required');
        });

        it('should fail to register a dog with missing description', async () => {
            const dogData = {
                name: 'Buddy'
            };

            const res = await chai.request(app)
                .post('/api/dogs')
                .set('Authorization', `Bearer ${token1}`)
                .send(dogData);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('required');
        });
    });

    describe('PUT /api/dogs/:id/adopt - Dog Adoption', () => {
        let testDog;

        beforeEach(async () => {
            testDog = await createTestDog(testUser1._id, {
                name: 'Max',
                description: 'A loyal companion'
            });
        });

        it('should allow an authenticated user to adopt an available dog', async () => {
            const adoptionData = {
                thankYouMessage: 'Thank you for taking care of Max!'
            };

            const res = await chai.request(app)
                .put(`/api/dogs/${testDog._id}/adopt`)
                .set('Authorization', `Bearer ${token2}`)
                .send(adoptionData);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Dog adopted successfully!');
            expect(res.body.data.dog).to.have.property('status', 'adopted');
            expect(res.body.data.dog.adoptedBy).to.have.property('username', 'dogowner2');
            expect(res.body.data.dog).to.have.property('thankYouMessage', 'Thank you for taking care of Max!');
        });

        it('should fail to adopt a dog that is already adopted', async () => {
            // First adoption
            await chai.request(app)
                .put(`/api/dogs/${testDog._id}/adopt`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ thankYouMessage: 'Thanks!' });

            // Second adoption attempt
            const res = await chai.request(app)
                .put(`/api/dogs/${testDog._id}/adopt`)
                .set('Authorization', `Bearer ${token1}`)
                .send({ thankYouMessage: 'Thanks again!' });

            expect(res).to.have.status(409);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('already been adopted');
        });

        it('should fail to adopt a dog that the user has registered', async () => {
            const res = await chai.request(app)
                .put(`/api/dogs/${testDog._id}/adopt`)
                .set('Authorization', `Bearer ${token1}`)
                .send({ thankYouMessage: 'Thanks!' });

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('cannot adopt your own dog');
        });

        it('should fail to adopt a non-existent dog', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await chai.request(app)
                .put(`/api/dogs/${fakeId}/adopt`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ thankYouMessage: 'Thanks!' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('not found');
        });

        it('should fail to adopt with invalid dog ID', async () => {
            const res = await chai.request(app)
                .put('/api/dogs/invalid-id/adopt')
                .set('Authorization', `Bearer ${token2}`)
                .send({ thankYouMessage: 'Thanks!' });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('Invalid dog ID');
        });
    });

    describe('DELETE /api/dogs/:id - Dog Removal', () => {
        let testDog, adoptedDog;

        beforeEach(async () => {
            testDog = await createTestDog(testUser1._id, {
                name: 'Charlie',
                description: 'A playful beagle'
            });

            adoptedDog = await createTestDog(testUser1._id, {
                name: 'Luna',
                description: 'A gentle husky'
            });
            await adoptedDog.adoptDog(testUser2._id, 'Thanks for Luna!');
        });

        it('should allow an owner to remove their unadopted dog', async () => {
            const res = await chai.request(app)
                .delete(`/api/dogs/${testDog._id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Dog removed successfully');
        });

        it('should fail to remove a dog that has been adopted', async () => {
            const res = await chai.request(app)
                .delete(`/api/dogs/${adoptedDog._id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('Cannot remove an adopted dog');
        });

        it('should fail if a user tries to remove a dog registered by another user', async () => {
            const res = await chai.request(app)
                .delete(`/api/dogs/${testDog._id}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('can only remove dogs you registered');
        });

        it('should fail to remove a non-existent dog', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await chai.request(app)
                .delete(`/api/dogs/${fakeId}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('success', false);
            expect(res.body.message).to.include('not found');
        });
    });

    describe('GET /api/dogs/registered - List Registered Dogs', () => {
        beforeEach(async () => {
            // Create multiple dogs for user1
            await createTestDog(testUser1._id, { name: 'Dog1', description: 'First dog' });
            await createTestDog(testUser1._id, { name: 'Dog2', description: 'Second dog' });

            const dog3 = await createTestDog(testUser1._id, { name: 'Dog3', description: 'Third dog' });
            await dog3.adoptDog(testUser2._id, 'Thanks!');

            // Create dogs for user2
            await createTestDog(testUser2._id, { name: 'Dog4', description: 'Fourth dog' });
        });

        it('should return a paginated list of registered dogs', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/registered')
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data.dogs).to.be.an('array');
            expect(res.body.data.dogs).to.have.length(3); // user1 has 3 dogs
            expect(res.body.data.pagination).to.have.property('totalDogs', 3);
            expect(res.body.data.pagination).to.have.property('currentPage', 1);
        });

        it('should correctly filter registered dogs by status', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/registered?status=available')
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(200);
            expect(res.body.data.dogs).to.have.length(2); // 2 available dogs
            expect(res.body.data.dogs.every(dog => dog.status === 'available')).to.be.true;
        });

        it('should handle pagination correctly', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/registered?page=1&limit=2')
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(200);
            expect(res.body.data.dogs).to.have.length(2);
            expect(res.body.data.pagination).to.have.property('currentPage', 1);
            expect(res.body.data.pagination).to.have.property('hasNext', true);
        });
    });

    describe('GET /api/dogs/adopted - List Adopted Dogs', () => {
        beforeEach(async () => {
            // Create and adopt some dogs
            const dog1 = await createTestDog(testUser1._id, { name: 'AdoptedDog1', description: 'First adopted' });
            const dog2 = await createTestDog(testUser1._id, { name: 'AdoptedDog2', description: 'Second adopted' });

            await dog1.adoptDog(testUser2._id, 'Thanks for dog1!');
            await dog2.adoptDog(testUser2._id, 'Thanks for dog2!');

            // Create a non-adopted dog
            await createTestDog(testUser1._id, { name: 'NotAdopted', description: 'Still available' });
        });

        it('should return a paginated list of adopted dogs for the user', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/adopted')
                .set('Authorization', `Bearer ${token2}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data.dogs).to.be.an('array');
            expect(res.body.data.dogs).to.have.length(2); // user2 adopted 2 dogs
            expect(res.body.data.dogs.every(dog => dog.status === 'adopted')).to.be.true;
            expect(res.body.data.pagination).to.have.property('totalDogs', 2);
        });

        it('should return empty list for user with no adopted dogs', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/adopted')
                .set('Authorization', `Bearer ${token1}`);

            expect(res).to.have.status(200);
            expect(res.body.data.dogs).to.have.length(0);
            expect(res.body.data.pagination).to.have.property('totalDogs', 0);
        });

        it('should handle pagination for adopted dogs', async () => {
            const res = await chai.request(app)
                .get('/api/dogs/adopted?page=1&limit=1')
                .set('Authorization', `Bearer ${token2}`);

            expect(res).to.have.status(200);
            expect(res.body.data.dogs).to.have.length(1);
            expect(res.body.data.pagination).to.have.property('currentPage', 1);
            expect(res.body.data.pagination).to.have.property('hasNext', true);
        });
    });
});