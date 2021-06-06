import faker from 'faker';

export function generateUser() {
  return {
    id: undefined,
    name: faker.name.findName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  };
}

export function generateSubscriber() {
  return {
    id: undefined,
    name: faker.name.findName(),
    email: faker.internet.email().toLowerCase(),
    googleId: faker.random.uuid(),
  };
}