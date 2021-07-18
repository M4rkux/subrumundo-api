import request from 'supertest';
import app from '../../src/app';
import dbHandler from '../utils/dbHandler';
import * as defaultUser from '../../src/database/seeder/data-to-seed/user.json';
import { generatePatron } from '../factories';

const patronGeneratedGlobally = generatePatron();
let token = '';

beforeAll(async () => {
  await dbHandler.connect();
  const { body } = await request(app).post('/authentication/login').send({ email: defaultUser.email, password: defaultUser.password });
  token = body.token;
});

afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe('Test patron log authentications', () => {
  /** Test authentications */
  it('Should fail with 401', async () => {
    const { status } = await request(app).get('/patron-log').send();
    expect(status).toBe(401);
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron-log').set({ Authorization: `${token}` }).send();
    expect(body.error).toBe('Token error');
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron-log').set({ Authorization: `token ${token}` }).send();
    expect(body.error).toBe('Token malformatted');
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron-log').set({ Authorization: `Bearer token` }).send();
    expect(body.error).toBe('Token invalid');
  });
});

describe('Test patron log list', () => {
  /** Test patron log list */
  it('Should get the 10 first patron logs', async () => {
    for (let i = 1; i <= 13; i++) {
      let patronGenerated = generatePatron();
      await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    }
    const { body: { patronLogs } } = await request(app).get('/patron-log').set({ Authorization: `Bearer ${token}` }).send();
    expect(patronLogs.length).toBe(10);
  });

  it('Should get 10 first patron logs', async () => {
    const { body: { patronLogs } } = await request(app).get('/patron-log?page=-1').set({ Authorization: `Bearer ${token}` }).send();
    expect(patronLogs.length).toBe(10);
  });

  it('Should skip 10 first patron logs and get the 3 left', async () => {
    const { body: { patronLogs } } = await request(app).get('/patron-log?page=2').set({ Authorization: `Bearer ${token}` }).send();
    expect(patronLogs.length).toBe(3);
  });

  it('Should return the patron searched by email', async () => {
    await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGeneratedGlobally);
    const { body: { patronLogs } } = await request(app).get(`/patron-log?q=${patronGeneratedGlobally.email}`).set({ Authorization: `Bearer ${token}` }).send();
    const [patronLog] = patronLogs;
    expect(patronLog.email).toBe(patronGeneratedGlobally.email);
  });  

  it('Should return an empty array', async () => {
    const { body: { patronLogs } } = await request(app).get('/patron-log?page=100').set({ Authorization: `Bearer ${token}` }).send();
    expect(patronLogs.length).toBe(0);
  });

  it('Should return an empty array', async () => {
    const { body: { patronLogs } } = await request(app).get('/patron-log?q=111222333444555666').set({ Authorization: `Bearer ${token}` }).send();
    expect(patronLogs).toStrictEqual([]);
  });
});
