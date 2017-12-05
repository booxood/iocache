const JcacheWrapper = require('../index')('../bin/jcache-7.10.node')
const testCase = require('./test-case')

const JcacheClient = new JcacheWrapper({
  id: process.env.JCACHE_ID,
  name: process.env.JCACHE_NAME
})

testCase(JcacheClient, 'jcache')
