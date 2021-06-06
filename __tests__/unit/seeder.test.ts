import dbHandler from '../utils/dbHandler';
import { initSeed, Seeder } from '../../src/database/seeder'

beforeAll(async () => await dbHandler.connect());

afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe('Test the seed', () => {
  it('Should not do anything if it\'s already seeded', async () => {
    const result = await initSeed();
    expect(result).toBeFalsy();
  });

  it('Should throw error of duplicity', async () => {
    await Seeder.deleteMany({});
    let result;

    try {
      result = await initSeed();
    } catch (error) {
      expect(error).toBeTruthy();
    }
    expect(result).toBeFalsy();
  });
});