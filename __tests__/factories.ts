import faker from 'faker';

export default function generateUser() {
  return {
    name: faker.name.findName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  };
}