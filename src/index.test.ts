import * as RadixTrie from './index.js'

test('insert', () => {
  const trie = RadixTrie.empty()
  RadixTrie.insert(trie, 'foo')
  expect(trie).toEqual({
    f: { P: 'foo', E: true },
  })
  RadixTrie.insert(trie, 'foobar')
  expect(trie).toEqual({
    f: { P: 'foo', E: true, N: {
      b: { P: 'bar', E: true }
    } }
  })
  RadixTrie.insert(trie, 'foobaz')
  expect(trie).toEqual({
    f: { P: 'foo', E: true, N: {
      b: { P: 'ba', E: false, N: {
        r: { P: 'r', E: true },
        z: { P: 'z', E: true }
      } }
    } }
  })
})

test('simple', () => {
  const trie = RadixTrie.of([
    'foo',
    'boo',
    'foz',
    'fzz'
  ])
  expect(trie).toEqual({
    f: {
      P: 'f',
      E: false,
      N: {
        o: {
          P: 'o',
          N: { o: { P: 'o', E: true }, z: { P: 'z', E: true } },
          E: false
        },
        z: { P: 'zz', E: true }
      }
    },
    b: { P: 'boo', E: true }
  })
})

test('longest prefix', () => {
  const trie = RadixTrie.of([
    'foo',
    'foobar',
    'foobaz'
  ])
  expect(RadixTrie.longestPrefix(trie, 'foobarbaz')).toEqual('foobar')
  expect(RadixTrie.longestPrefix(trie, 'food')).toEqual('foo')
})

test('has', () => {
  const trie = RadixTrie.of([
    'foo',
    'foobar',
    'foobaz'
  ])
  expect(RadixTrie.has(trie, 'foo')).toBe(true)
  expect(RadixTrie.has(trie, 'foobar')).toBe(true)
  expect(RadixTrie.has(trie, 'foobaz')).toBe(true)
  expect(RadixTrie.has(trie, '')).toBe(false)
  expect(RadixTrie.has(trie, 'x')).toBe(false)
  expect(RadixTrie.has(trie, 'f')).toBe(false)
  expect(RadixTrie.has(trie, 'fo')).toBe(false)
  expect(RadixTrie.has(trie, 'foob')).toBe(false)
  expect(RadixTrie.has(trie, 'fooba')).toBe(false)
  expect(RadixTrie.has(trie, 'foobax')).toBe(false)
})
