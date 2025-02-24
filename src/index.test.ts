import * as RadixTrie from './index.js'

test('insert', () => {
  const trie = RadixTrie.empty()
  RadixTrie.insert(trie, 'foo')
  expect(trie).toEqual({
    f: { P: 'foo', E: true }
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

test('empty strings', () => {
  const trie = RadixTrie.of([ '' ])
  expect(RadixTrie.has(trie, '')).toBe(true)
})

test('mixed empty and non-empty strings', () => {
  // Test handling of empty strings alongside non-empty strings
  const trie = RadixTrie.empty()

  // First insert empty string
  RadixTrie.insert(trie, '')
  expect(RadixTrie.has(trie, '')).toBe(true)

  // Then insert non-empty strings
  RadixTrie.insert(trie, 'a')
  RadixTrie.insert(trie, 'ab')

  // All strings should be preserved in the trie
  expect(RadixTrie.has(trie, '')).toBe(true)
  expect(RadixTrie.has(trie, 'a')).toBe(true)
  expect(RadixTrie.has(trie, 'ab')).toBe(true)

  // Create trie in reverse order
  const trie2 = RadixTrie.of([ 'ab', 'a', '' ])

  expect(RadixTrie.has(trie2, '')).toBe(true)
  expect(RadixTrie.has(trie2, 'a')).toBe(true)
  expect(RadixTrie.has(trie2, 'ab')).toBe(true)
})

test('preserve prefix as valid word when splitting', () => {

  // Test that when a node is split, if the prefix itself was a valid word (e=true),
  // that information is preserved after the split
  const trie = RadixTrie.empty()

  // First insert "test" into the trie
  RadixTrie.insert(trie, 'test')
  expect(RadixTrie.has(trie, 'test')).toBe(true)

  // Then insert "testing" which shares the prefix "test"
  // This should cause a split at the node containing "test"
  RadixTrie.insert(trie, 'testing')

  // After the split, "test" should still be a valid word in the trie
  expect(RadixTrie.has(trie, 'test')).toBe(true)
  expect(RadixTrie.has(trie, 'testing')).toBe(true)
})
