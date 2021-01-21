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

const userManuallyGenerated = {
  id: undefined,
  name: 'newusertobefound',
  email: 'wonderful@email.com',
  password: '123'
};

describe('Register user', () => {
  /** Test authentications */
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

  /** Test registry */
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

  /** Test list */
  it('Should get the user list', async () => {
    const { body } = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.users.length).toBe(3);
  });

  it('Should get the 10 first users', async () => {
    for(let i = 1; i <= 10; i++) {
      let userGenerated = generateUser();
      await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userGenerated);
    }
    const { body } = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.users.length).toBe(10);
  });

  it('Should get 10 first users', async () => {
    const { body } = await request(app).get('/user?page=-1').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.users.length).toBe(10);
  });

  it('Should skip 10 first users and get the 3 left', async () => {
    const { body } = await request(app).get('/user?page=2').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.users.length).toBe(3);
  });

  it('Should return an empty array', async () => {
    const { body } = await request(app).get('/user?page=100').set({ Authorization: `Bearer ${token}` }).send();
    expect(body.users.length).toBe(0);
  });

  it('Should return the user searched by name', async () => {
    await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userManuallyGenerated);
    const { body } = await request(app).get('/user?q=newuser').set({ Authorization: `Bearer ${token}` }).send();
    const [user] = body.users;
    expect(user.name).toBe(userManuallyGenerated.name);
  });

  it('Should return the user searched by email', async () => {
    await request(app).post('/user').set({ Authorization: `Bearer ${token}` }).send(userManuallyGenerated);
    const { body } = await request(app).get('/user?q=wonderful').set({ Authorization: `Bearer ${token}` }).send();
    const [user] = body.users;
    expect(user.name).toBe(userManuallyGenerated.name);
  });

  it('Should return an empty array', async () => {
    const { body } = await request(app).get('/user?q=111222333444555666').set({ Authorization: `Bearer ${token}` }).send();
    const users = body.users;
    expect(users).toStrictEqual([]);
  });

  /** Test get user */
  it('Should return the user by id', async () => {
    let { body } = await request(app).get(`/user?q=${userManuallyGenerated.name}`).set({ Authorization: `Bearer ${token}` }).send();
    const [userToFind] = body.users;
    userManuallyGenerated.id = userToFind.id;
    const data = await request(app).get(`/user/${userToFind.id}`).set({ Authorization: `Bearer ${token}` }).send();
    const { user } = data.body;
    expect(user.name).toBe(userToFind.name);
  });

  it('Should not find the user by id', async () => {
    const data = await request(app).get(`/user/6008ee91bd917e479ff1666e`).set({ Authorization: `Bearer ${token}` }).send();
    const { user } = data.body;
    expect(user).toBeFalsy();
  });

  it('Should throw error with invalid objectId on get', async () => {
    const { status } = await request(app).get(`/user/666`).set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });

  /** Test delete user */
  it('Should throw error with invalid objectId on delete', async () => {
    const { status } = await request(app).delete(`/user/666`).set({ Authorization: `Bearer ${token}` }).send();
    expect(status).toBe(400);
  });

  it('Should not find the user by id', async () => {
    let data = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    const prevTotal = data.body.total;
    
    await request(app).delete(`/user/6008ee91bd917e479ff1666e`).set({ Authorization: `Bearer ${token}` }).send();

    data = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    const currTotal = data.body.total;
    expect(currTotal).toBe(prevTotal);
  });

  it('Should delete one user', async () => {
    let data = await request(app).get('/user?page=2').set({ Authorization: `Bearer ${token}` }).send();
    const [userToDelete] = data.body.users;
    const prevTotal = data.body.total;
    
    await request(app).delete(`/user/${userToDelete.id}`).set({ Authorization: `Bearer ${token}` }).send();

    data = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    const currTotal = data.body.total;
    expect(currTotal).toBe(prevTotal - 1);
  });

  /** Test edit user */
  it('Should throw error with invalid objectId on edit', async () => {
    const { status } = await request(app).put(`/user/666`).set({ Authorization: `Bearer ${token}` }).send({...userManuallyGenerated, name: 'newUser'});
    expect(status).toBe(400);
  });

  it('Should not find the user by id', async () => {
    const { body } = await request(app).put(`/user/6008ee91bd917e479ff1666e`).set({ Authorization: `Bearer ${token}` }).send({...userManuallyGenerated, name: 'newUser'});

    expect(body.user).toBeFalsy();
  });
  
  it('Should edit only the user name', async () => {
    const data = await request(app).get('/user').set({ Authorization: `Bearer ${token}` }).send();
    const [userToModity] = data.body.users;
    await request(app).put(`/user/${userToModity.id}`).set({ Authorization: `Bearer ${token}` }).send({ name: 'Administrator'});
    const { body } = await request(app).get(`/user/${userToModity.id}`).set({ Authorization: `Bearer ${token}` }).send();

    expect(body.user).toMatchObject({...userToModity, name: 'Administrator'});
  });

  it('Should edit only the user email', async () => {
    await request(app).put(`/user/${userManuallyGenerated.id}`).set({ Authorization: `Bearer ${token}` }).send({ email: 'updated@email'});
    const { body } = await request(app).get(`/user/${userManuallyGenerated.id}`).set({ Authorization: `Bearer ${token}` }).send();

    expect({...body.user, password: userManuallyGenerated.password}).toMatchObject({...userManuallyGenerated, email: 'updated@email'});
  });

  it('Should edit an user name', async () => {
    await request(app).put(`/user/${userManuallyGenerated.id}`).set({ Authorization: `Bearer ${token}` }).send({...userManuallyGenerated, name: 'userUpdated'});
    const { body } = await request(app).get(`/user/${userManuallyGenerated.id}`).set({ Authorization: `Bearer ${token}` }).send();

    expect(body.user.name).toBe('userUpdated');
  });
});