module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/__tests__/.*\\.(test|spec)?\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};