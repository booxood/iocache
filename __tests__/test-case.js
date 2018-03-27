module.exports = function (cacheClient, cacheType) {
  describe(cacheType, () => {
    beforeEach(async () => {
      await cacheClient.del('string', 'list', 'hash')
    })
    afterAll(() => {
      cacheClient.disconnect()
    })
    describe('string', () => {
      it('set key value | get key', async () => {
        await cacheClient.set('string', 'ok')
        expect(await cacheClient.get('string')).toBe('ok')
      })
      it('set key EX seconds *', async () => {
        await cacheClient.set('string', 'ok', 'EX', 1)
        expect(await cacheClient.get('string')).toBe('ok')
        await (new Promise(resolve => {
          setTimeout(function () {
            cacheClient.get('string').then(v => {
              if (cacheType === 'redis') {
                expect(v).toBe(null) // redis
              } else if (cacheType === 'jcache') {
                expect(v).toBe(undefined) // jcache
              }
              resolve()
            })
          }, 1010)
        }))
      })
      it('set key PX milliseconds *', async () => {
        await cacheClient.set('string', 'ok', 'PX', 10)
        expect(await cacheClient.get('string')).toBe('ok')
        await (new Promise(resolve => {
          setTimeout(function () {
            cacheClient.get('string').then(v => {
              if (cacheType === 'redis') {
                expect(v).toBe(null) // redis
              } else if (cacheType === 'jcache') {
                expect(v).toBe(undefined) // jcache
              }
              resolve()
            })
          }, 20)
        }))
      })
      it('set key NX', async () => {
        expect(await cacheClient.set('string', 's1', 'PX', 10, 'NX')).toBe('OK')

        expect(!!await cacheClient.set('string', 's2', 'PX', 10, 'NX')).toBe(false)
        if (cacheType === 'redis') {
          expect(await cacheClient.set('string', 's2', 'PX', 10, 'NX')).toBe(null) // redis
        } else if (cacheType === 'jcache') {
          expect(await cacheClient.set('string', 's2', 'PX', 10, 'NX')).toBe(undefined) // jcache
        }

        expect(await cacheClient.get('string')).toBe('s1')
        await (new Promise(resolve => {
          setTimeout(function () {
            cacheClient.get('string').then(v => {
              expect(!!v).toBe(false)
              resolve()
            })
          }, 20)
        }))
      })

      it('set key XX', async () => {
        if (cacheType === 'redis') {
          expect(await cacheClient.set('string', 's1', 'PX', 10, 'XX')).toBe(null)
        } else if (cacheType === 'jcache') {
          expect(await cacheClient.set('string', 's1', 'PX', 10, 'XX')).toBe(undefined)
        }

        await cacheClient.set('string', 's1')
        expect(await cacheClient.get('string')).toBe('s1')

        expect(await cacheClient.set('string', 's2', 'PX', 10, 'XX')).toBe('OK')

        expect(await cacheClient.get('string')).toBe('s2')
        await (new Promise(resolve => {
          setTimeout(function () {
            cacheClient.get('string').then(v => {
              expect(!!v).toBe(false)
              resolve()
            })
          }, 20)
        }))
      })
    })

    describe('list', () => {
    // 后进，前出
      it('rpush key value | lpop key', async () => {
        await cacheClient.rpush('list', 'v1')
        await cacheClient.rpush('list', 'v2')
        await cacheClient.rpush('list', 'v3')
        expect(await cacheClient.lpop('list')).toBe('v1')
        expect(await cacheClient.lpop('list')).toBe('v2')
        expect(await cacheClient.lpop('list')).toBe('v3')
      })
      // 前进，后出
      it('lpush key value | rpop key', async () => {
        await cacheClient.lpush('list', 'v1')
        await cacheClient.lpush('list', 'v2')
        await cacheClient.lpush('list', 'v3')
        expect(await cacheClient.rpop('list')).toBe('v1')
        expect(await cacheClient.rpop('list')).toBe('v2')
        expect(await cacheClient.rpop('list')).toBe('v3')
      })
      // 将一个 list 后面的元素拿出来，插入到另外一个 list 的最前面
      it('rpoplpush source destination', async () => {
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
      it('lrem key 0 value', async () => {
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
      it('lrem key 1 value', async () => {
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
      it('lrem key -1 value', async () => {
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
      it('lrange key start stop', async () => {
        await cacheClient.lpush('list', 'v1')
        await cacheClient.lpush('list', 'v2')
        await cacheClient.lpush('list', 'v1')

        expect(await cacheClient.lrange('list', 0, -1)).toEqual(['v1', 'v2', 'v1'])
        expect(await cacheClient.lrange('list', 1, -1)).toEqual(['v2', 'v1'])
      })
    })

    describe('hash', () => {
      it('hset key field value | hget key field', async () => {
        // number value
        await cacheClient.hset('hash', 'v1', 1)
        expect(await cacheClient.hget('hash', 'v1')).toBe('1')

        // string value
        await cacheClient.hset('hash', 'v2', 'ok')
        expect(await cacheClient.hget('hash', 'v2')).toBe('ok')

        // no value
        if (cacheType === 'redis') {
          expect(await cacheClient.hget('hash', 'no')).toBe(null)
        } else if (cacheType === 'jcache') {
          expect(await cacheClient.hget('hash', 'no')).toBe(undefined)
        }
      })
      it('hdel key field *', async () => {
        await cacheClient.hset('hash', 'v2', 'ok')
        expect(await cacheClient.hget('hash', 'v2')).toBe('ok')
        await cacheClient.hdel('hash', 'v2')

        // expect(await cacheClient.hget('hash', 'v2')).toBe(null) // redis
        // expect(await cacheClient.hget('hash', 'v2')).toBe(undefined) // jcache
        expect(!!await cacheClient.hget('hash', 'v2')).toBe(false)
      })
      it('hincrby key field *', async () => {
        await cacheClient.hset('hash', 'v1', 1)

        // expect(await cacheClient.hincrby('hash', 'v1', 2)).toBe(3) // redis
        // expect(await cacheClient.hincrby('hash', 'v1', 2)).toBe('3') // jcache
        expect(+await cacheClient.hincrby('hash', 'v1', 2)).toBe(3)

        expect(await cacheClient.hget('hash', 'v1')).toBe('3')
      })

      it('hgetall key', async () => {
        await cacheClient.hset('hash', 'v1', 1)
        await cacheClient.hset('hash', 'v2', 2)
        await cacheClient.hset('hash', 'v3', 3)

        expect(await cacheClient.hgetall('hash')).toEqual({v1: '1', v2: '2', v3: '3'})
        expect(await cacheClient.hgetall('xxxx')).toEqual({})
      })

      it('hmset key', async () => {
        expect(await cacheClient.hgetall('hash')).toEqual({})

        await cacheClient.hmset('hash', 'v1', 1, 'v2', 2, 'v3', 3)
        expect(await cacheClient.hgetall('hash')).toEqual({v1: '1', v2: '2', v3: '3'})
      })

      it('hmset key object', async () => {
        expect(await cacheClient.hgetall('hash')).toEqual({})

        await cacheClient.hmset('hash', {v1: 1, v2: 2, v3: 3})
        expect(await cacheClient.hgetall('hash')).toEqual({v1: '1', v2: '2', v3: '3'})
      })
    })
  })
}
