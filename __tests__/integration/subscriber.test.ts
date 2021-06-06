import request from 'supertest';
import app from '../../src/app';
import dbHandler from '../utils/dbHandler';
import * as defaultUser from '../../src/database/seeder/data-to-seed/user.json';
import { generateSubscriber } from '../factories';

const subscriberGeneratedGlobally = generateSubscriber();
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

describe('Test subscriber authentications', () => {
  /** Test authentications */
  it('Should fail with 401', async () => {
    const { status } = await request(app).get('/subscriber').send();
    expect(status).toBe(401);
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/subscriber').set({ Authorization: `${token}` }).send();
    expect(body.error).toBe('Token error');
  });
  
  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/subscriber').set({ Authorization: `token ${token}` }).send();
    expect(body.error).toBe('Token malformatted');
  });
  
  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/subscriber').set({ Authorization: `Bearer token` }).send();
    expect(body.error).toBe('Token invalid');
  });
});

describe('Test subscriber registry', () => {
  /** Test registry */
  it('Should fail without any fields', async () => {
    const { status } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });
  it('Should fail without email', async () => {
    const { status } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send({name: 'name1', googleId: 'abcd123'});
    expect(status).toBe(400);
  });

  it('Should fail without name', async () => {
    const { status } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send({email: 'name2@email.com', googleId: 'abcd123'});
    expect(status).toBe(400);
  });
  
  it('Should fail without password', async () => {
    const { status } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send({name: 'name3', email: 'email3@email.com'});
    expect(status).toBe(400);
  });

  it('Should register the subscriber and return the subscriber', async () => {
    const subscriberGenerated = generateSubscriber();
    const { status, body } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    expect(status).toBe(200);
    expect(body.subscriber.name).toBe(subscriberGenerated.name);
  });

  it('Should try register the same subscriber and receive an registration failed', async () => {
    const subscriberGenerated = generateSubscriber();
    await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    const { status } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    expect(status).toBe(400);
  });
});

describe('Test subscriber registry', () => {
  /** Test list */
  it('Should get the subscriber list', async () => {
    const { body } = await request(app).get('/subscriber').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.subscribers.length).toBe(2);
  });

  it('Should get the 10 first subscribers', async () => {
    for (let i = 1; i <= 10; i++) {
      let subscriberGenerated = generateSubscriber();
      await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    }
    const { body } = await request(app).get('/subscriber').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.subscribers.length).toBe(10);
  });

  it('Should get 10 first subscribers', async () => {
    const { body } = await request(app).get('/subscriber?page=-1').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.subscribers.length).toBe(10);
  });

  it('Should skip 10 first subscribers and get the 3 left', async () => {
    const { body } = await request(app).get('/subscriber?page=2').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.subscribers.length).toBe(2);
  });

  it('Should return an empty array', async () => {
    const { body } = await request(app).get('/subscriber?page=100').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.subscribers.length).toBe(0);
  });

  it('Should return the subscriber searched by name', async () => {
    await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGeneratedGlobally);
    const { body } = await request(app).get(`/subscriber?q=${subscriberGeneratedGlobally.name}`).set({ Authorization: `Bearer ${token}` }).send();
    const [subscriber] = body.subscribers;
    expect(subscriber.name).toBe(subscriberGeneratedGlobally.name);
  });

  it('Should return the subscriber searched by email', async () => {
    await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGeneratedGlobally);
    const { body } = await request(app).get(`/subscriber?q=${subscriberGeneratedGlobally.email}`).set({ Authorization: `Bearer ${token}` }).send();
    const [subscriber] = body.subscribers;
    expect(subscriber.name).toBe(subscriberGeneratedGlobally.name);
  });

  it('Should return an empty array', async () => {
    const { body } = await request(app).get('/subscriber?q=111222333444555666').set({ Authorization: `Bearer ${token}` }).send();
    const subscribers = body.subscribers;
    expect(subscribers).toStrictEqual([]);
  });
});

describe('Test get Subscriber', () => {
  /** Test get subscriber */
  it('Should return the subscriber by id', async () => {
    const { body } = await request(app).get(`/subscriber?q=${subscriberGeneratedGlobally.name}`).set({ Authorization: `Bearer ${token}` }).send();
    const [subscriberToFind] = body.subscribers;
    subscriberGeneratedGlobally.id = subscriberToFind.id;
    const data = await request(app).get(`/subscriber/${subscriberToFind.id}`).set({ Authorization: `Bearer ${token}` }).send();
    const { subscriber } = data.body;
    expect(subscriber.name).toBe(subscriberToFind.name);
  });

  it('Should not find the subscriber by id', async () => {
    const data = await request(app).get(`/subscriber/aaaabbbbccccddd1111`).set({ Authorization: `Bearer ${token}` }).send();
    const { subscriber } = data.body;
    expect(subscriber).toBeFalsy();
  });

  it('Should throw error with invalid objectId on get', async () => {
    const { status } = await request(app).get(`/subscriber/666`).set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });
});