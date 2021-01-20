import request from 'supertest';
import app from '../../src/app';
import generateUser from '../factories';
import dbHandler from '../utils/dbHandler';
import  * as defaultUser from '../../src/database/seeder/data-to-seed/user.json';

let token = '';

beforeAll(async () => {
  await dbHandler.connect();
  const { body } = await request(app).post('/authentication/login').send({ email: defaultUser.email, password: defaultUser.password});
  token = body.token;
});

afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe('Register user', () => {
  it('Should fail with 401', async () => {
    const { status } = await request(app).post('/user').send();
    expect(status).toBe(401);
  });
  
  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).post('/user').set({ Authorization: `${token}` }).send();
    expect(body.error).toBe('Token error');
  });
  
  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).post('/user').set({ Authorization: `token ${token}` }).send();
    expect(body.error).toBe('Token malformatted');
  });
  
  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).post('/user').set({ Authorization: `Bearer token` }).send();
    expect(body.error).toBe('Token invalid');
  });

  it('Should fail without any fields', async () => {
    const { status } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });

  it('Should fail without email', async () => {
    const { status } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send({name: 'name1', password: 'pass1'});
    expect(status).toBe(400);
  });

  it('Should fail without name', async () => {
    const { status } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send({email: 'name2@email.com', password: 'pass2'});
    expect(status).toBe(400);
  });
  
  it('Should fail without password', async () => {
    const { status } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send({name: 'name3', email: 'email3@email.com'});
    expect(status).toBe(400);
  });

  it('Should register the user and return the user', async () => {
    const userGenerated = generateUser();
    const { status, body } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userGenerated);
    expect(status).toBe(200);
    expect(body.user.name).toBe(userGenerated.name);
  });

  it('Should receive an registration failed', async () => {
    const userGenerated = generateUser();
    await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userGenerated);
    const { status } = await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userGenerated);
    expect(status).toBe(400);
  });
});