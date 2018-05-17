const Redis = require('ioredis')
const testCase = require('./test-case')

const redisUri = process.env.REDIS_URI || 'redis://localhost:6379/0'

const redisClient = new Redis(redisUri)

redisClient.multiSet = async (...argvs) => {
  let setArgs = argvs[0]
  if (!Array.isArray(argvs[0])) {
    setArgs = [[...argvs]]
  }
  let mutiArgs = setArgs.map((item) => { return ['set', ...item] })
  return redisClient.multi(mutiArgs).exec()
}

testCase(redisClient, 'redis')
