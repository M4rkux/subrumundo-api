import request from 'supertest';
import app from '../../src/app';
import dbHandler from '../utils/dbHandler';
import * as defaultUser from '../../src/database/seeder/data-to-seed/user.json';
import { generatePatron, generateSubscriber } from '../factories';

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

describe('Test patron authentications', () => {
  /** Test authentications */
  it('Should fail with 401', async () => {
    const { status } = await request(app).get('/patron').send();
    expect(status).toBe(401);
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron').set({ Authorization: `${token}` }).send();
    expect(body.error).toBe('Token error');
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron').set({ Authorization: `token ${token}` }).send();
    expect(body.error).toBe('Token malformatted');
  });

  it('Should fail with 401 token error', async () => {
    const { body } = await request(app).get('/patron').set({ Authorization: `Bearer token` }).send();
    expect(body.error).toBe('Token invalid');
  });
});

describe('Test patron registry', () => {
  /** Test registry */
  it('Should fail without any fields', async () => {
    const { status } = await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });

  it('Should register the patron and return the patron', async () => {
    const patronGenerated = generatePatron();
    const { status, body: { patron } } = await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    expect(status).toBe(200);
    expect(patron.email).toBe(patronGenerated.email);
  });

  it('Should try register the same patron and receive an registration failed', async () => {
    const patronGenerated = generatePatron();
    await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    const { status } = await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    expect(status).toBe(400);
  });

  it('Should register the patron check subscriber', async () => {
    let subscriberGenerated = generateSubscriber();
    const patronGenerated = generatePatron();
    subscriberGenerated = { ...subscriberGenerated, email: patronGenerated.email };
    const { body: { subscriber } } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    const { body: { subscriber: subscriberToFind } } = await request(app).get(`/subscriber/${subscriber.id}`).set({ Authorization: `Bearer ${token}` }).send();
    expect(subscriberToFind.isPatron).toBe(true);
  });
});

describe('Test patron registry', () => {
  /** Test list */
  it('Should get the patron list', async () => {
    const { body: { patrons } } = await request(app).get('/patron').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons.length).toBe(3);
  });

  it('Should get the 10 first patrons', async () => {
    for (let i = 1; i <= 10; i++) {
      let patronGenerated = generatePatron();
      await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGenerated);
    }
    const { body: { patrons } } = await request(app).get('/patron').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons.length).toBe(10);
  });

  it('Should get 10 first patrons', async () => {
    const { body: { patrons } } = await request(app).get('/patron?page=-1').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons.length).toBe(10);
  });

  it('Should skip 10 first patrons and get the 3 left', async () => {
    const { body: { patrons } } = await request(app).get('/patron?page=2').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons.length).toBe(3);
  });

  it('Should return an empty array', async () => {
    const { body: { patrons } } = await request(app).get('/patron?page=100').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons.length).toBe(0);
  });

  it('Should return the patron searched by email', async () => {
    await request(app).post('/patron').set({ Authorization: `Bearer ${token}` }).send(patronGeneratedGlobally);
    const { body: { patrons } } = await request(app).get(`/patron?q=${patronGeneratedGlobally.email}`).set({ Authorization: `Bearer ${token}` }).send();
    const [patron] = patrons;
    expect(patron.email).toBe(patronGeneratedGlobally.email);
  });

  it('Should return an empty array', async () => {
    const { body: { patrons } } = await request(app).get('/patron?q=111222333444555666').set({ Authorization: `Bearer ${token}` }).send();
    expect(patrons).toStrictEqual([]);
  });
});

describe('Test get Patron', () => {
  /** Test get patron */
  it('Should return the patron by id', async () => {
    const { body: { patrons } } = await request(app).get(`/patron?q=${patronGeneratedGlobally.email}`).set({ Authorization: `Bearer ${token}` }).send();
    const [patronToFind] = patrons;
    patronGeneratedGlobally.id = patronToFind.id;
    const { body: { patron } } = await request(app).get(`/patron/${patronToFind.id}`).set({ Authorization: `Bearer ${token}` }).send();
    expect(patron.email).toBe(patronToFind.email);
  });

  it('Should not find the patron by id', async () => {
    const { body: { patron } } = await request(app).get(`/patron/aaaabbbbccccddd1111`).set({ Authorization: `Bearer ${token}` }).send();
    expect(patron).toBeFalsy();
  });

  it('Should throw error with invalid objectId on get', async () => {
    const { status } = await request(app).get(`/patron/666`).set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });
});

describe('Test delete Patron', () => {
  /** Test delete user */
  it('Should throw error with invalid objectId on delete', async () => {
    const { status } = await request(app).delete(`/patron/666`).set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });

  it('Should not find the patron by id', async () => {
    let data = await request(app).get('/patron').set({ Authorization: `Bearer ${token}` }).send();
    const prevTotal = data.body.total;

    await request(app).delete(`/patron/6008ee91bd917e479ff1666e`).set({ Authorization: `Bearer ${token}` }).send();

    data = await request(app).get('/patron').set({ Authorization: `Bearer ${token}` }).send();
    const currTotal = data.body.total;
    expect(currTotal).toBe(prevTotal);
  });

  it('Should delete one patron', async () => {
    const { body: { patrons, total: prevTotal } } = await request(app).get('/patron?page=2').set({ Authorization: `Bearer ${token}` }).send();
    const [patronToDelete] = patrons;
    let subscriberGenerated = generateSubscriber();
    subscriberGenerated = { ...subscriberGenerated, email: patronToDelete.email };
    const { body: { subscriber: subscriberToUpdate } } = await request(app).post('/subscriber').set({ Authorization: `Bearer ${token}` }).send(subscriberGenerated);
    await request(app).delete(`/patron/${patronToDelete.id}`).set({ Authorization: `Bearer ${token}` }).send();
    const { body: { subscriber } } = await request(app).get(`/subscriber/${subscriberToUpdate.id}`).set({ Authorization: `Bearer ${token}` }).send();
    const { body: { total: currTotal } } = await request(app).get('/patron').set({ Authorization: `Bearer ${token}` }).send();

    expect(subscriber.isPatron).toBe(false);
    expect(currTotal).toBe(prevTotal - 1);
  });
});