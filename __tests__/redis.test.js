const Redis = require('ioredis')
const testCase = require('./test-case')

const redisUri = process.env.REDIS_URI || 'redis://localhost:6379/0'

const redisClient = new Redis(redisUri)

testCase(redisClient, 'redis')
