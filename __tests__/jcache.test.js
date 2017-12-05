const path = require('path')
const JcacheWrapper = require('../index')(path.resolve(__dirname, '../bin/jcache-7.10.node'))
const testCase = require('./test-case')

const JcacheClient = new JcacheWrapper({
  id: 788,
  name: process.env.JCACHE_NAME
})

testCase(JcacheClient, 'jcache')
