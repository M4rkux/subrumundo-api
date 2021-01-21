import request from 'supertest';
import app from '../../src/app';
import dbHandler from '../utils/dbHandler';
import  * as defaultUser from '../../src/database/seeder/data-to-seed/user.json';
import { initSeed } from '../../src/database/seeder';

beforeAll(async () => await dbHandler.connect());
beforeEach(async () => await initSeed());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Test the login', () => {
  it('Should fail on login without parameters', async () => {
    const response = await request(app).post('/authentication/login');
    expect(response.status).toBe(400);
  });

  it('Should fail login invalid', async () => {
    const response = await request(app).post('/authentication/login').send({ email: 'subrumundo@gmail.com', password: '123'});
    expect(response.status).toBe(401);
  });

  it('Should login and return 200', async () => {
    const { status } = await request(app).post('/authentication/login').send({ email: defaultUser.email, password: defaultUser.password});
    expect(status).toBe(200);
  });

  it('Should login and return the user', async () => {
    const { body } = await request(app).post('/authentication/login').send({ email: defaultUser.email, password: defaultUser.password});
    expect(body['user']['email']).toBe(defaultUser.email);
  });

  it('Should login and return the token', async () => {
    const { body } = await request(app).post('/authentication/login').send({ email: defaultUser.email, password: defaultUser.password});
    expect(body).toHaveProperty('token');
  });
});