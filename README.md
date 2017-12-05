# iocache

对 jcache 进行了一层封装，提供与 `ioredis` 相同的 API，但是 

- **不是所有的功能都支持**
- **也不是所有的返回结果都一致**

请查看 `__tests__/test-case.js` 里的测试示例的结果。

## 安装

```sh
npm i iocache
```

## 使用

```js
const path = require('path')
const JcacheWrapper = require('iocache')(path.resolve(__dirname, './bin/jcache.node'))

const JcacheClient = new JcacheWrapper({
  id: 788,
  name: process.env.JCACHE_NAME
})

(async function () {
  await cacheClient.set('string', 'ok')
  await cacheClient.get('string')

  await cacheClient.rpush('list', 'v1')
  await cacheClient.rpop('list')
})()

```
