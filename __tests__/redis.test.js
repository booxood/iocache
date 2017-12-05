const Redis = require('ioredis')
const testCase = require('./test-case')

const redisClient = new Redis('redis://localhost:6379/0')

testCase(redisClient, 'redis')
