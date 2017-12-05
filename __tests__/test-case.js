module.exports = function (cacheClient, cacheType) {
  describe(cacheType, () => {
    beforeEach(async () => {
      await cacheClient.del('string', 'list', 'hash')
    })
    afterAll(() => {
      cacheClient.disconnect()
    })
    it('string[set, get]', async () => {
      await cacheClient.set('string', 'ok')
      expect(await cacheClient.get('string')).toBe('ok')
    })
    // 后进，前出
    it('list[rpush, lpop]', async () => {
      await cacheClient.rpush('list', 'v1')
      await cacheClient.rpush('list', 'v2')
      await cacheClient.rpush('list', 'v3')
      expect(await cacheClient.lpop('list')).toBe('v1')
      expect(await cacheClient.lpop('list')).toBe('v2')
      expect(await cacheClient.lpop('list')).toBe('v3')
    })
    // 前进，后出
    it('list[lpush, rpop]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v3')
      expect(await cacheClient.rpop('list')).toBe('v1')
      expect(await cacheClient.rpop('list')).toBe('v2')
      expect(await cacheClient.rpop('list')).toBe('v3')
    })
    // 将一个 list 后面的元素拿出来，插入到另外一个 list 的最前面
    it('list[rpoplpush]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v3')
      expect(await cacheClient.rpoplpush('list', 'list_other')).toBe('v1')
      expect(await cacheClient.rpoplpush('list', 'list_other')).toBe('v2')
      expect(await cacheClient.rpoplpush('list', 'list_other')).toBe('v3')
      expect(await cacheClient.rpop('list_other')).toBe('v1')
      expect(await cacheClient.rpop('list_other')).toBe('v2')
      expect(await cacheClient.rpop('list_other')).toBe('v3')
    })
    // 删除 0
    it('list[lrem 0]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v3')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v1')

      await cacheClient.lrem('list', 0, 'v1')

      expect(await cacheClient.lpop('list')).toBe('v2')
      expect(await cacheClient.lpop('list')).toBe('v3')
      expect(await cacheClient.lpop('list')).toBe('v2')
    })
    // 删除 1
    it('list[lrem 1]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v3')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v1')

      await cacheClient.lrem('list', 1, 'v2')

      expect(await cacheClient.lpop('list')).toBe('v1')
      expect(await cacheClient.lpop('list')).toBe('v3')
      expect(await cacheClient.lpop('list')).toBe('v2')
      expect(await cacheClient.lpop('list')).toBe('v1')
    })
    // 删除 -1
    it('list[lrem -1]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v3')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v1')

      await cacheClient.lrem('list', -1, 'v1')

      expect(await cacheClient.lpop('list')).toBe('v1')
      expect(await cacheClient.lpop('list')).toBe('v2')
      expect(await cacheClient.lpop('list')).toBe('v3')
      expect(await cacheClient.lpop('list')).toBe('v2')
    })
    // 获取
    it('list[lrange]', async () => {
      await cacheClient.lpush('list', 'v1')
      await cacheClient.lpush('list', 'v2')
      await cacheClient.lpush('list', 'v1')

      expect(await cacheClient.lrange('list', 0, -1)).toEqual(['v1', 'v2', 'v1'])
      expect(await cacheClient.lrange('list', 1, -1)).toEqual(['v2', 'v1'])
    })
    it('hash[hset, hget]', async () => {
      await cacheClient.hset('hash', 'v1', 1)
      expect(await cacheClient.hget('hash', 'v1')).toBe('1')

      await cacheClient.hset('hash', 'v2', 'ok')
      expect(await cacheClient.hget('hash', 'v2')).toBe('ok')
    })
    it('hash[hdel] *', async () => {
      await cacheClient.hset('hash', 'v2', 'ok')
      expect(await cacheClient.hget('hash', 'v2')).toBe('ok')
      await cacheClient.hdel('hash', 'v2')

      // expect(await cacheClient.hget('hash', 'v2')).toBe(null) // redis
      // expect(await cacheClient.hget('hash', 'v2')).toBe(undefined) // jcache
      expect(!!await cacheClient.hget('hash', 'v2')).toBe(false)
    })
    it('hash[hincrby] *', async () => {
      await cacheClient.hset('hash', 'v1', 1)

      // expect(await cacheClient.hincrby('hash', 'v1', 2)).toBe(3) // redis
      // expect(await cacheClient.hincrby('hash', 'v1', 2)).toBe('3') // jcache
      expect(+await cacheClient.hincrby('hash', 'v1', 2)).toBe(3)

      expect(await cacheClient.hget('hash', 'v1')).toBe('3')
    })
  })
}
