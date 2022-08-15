
export type Edge = {

  /** End of string. */
  E: boolean,

  /** Prefix. */
  P: string,

  /** Node. */
  N?: RadixTrie

}

export type RadixTrie =
  Record<string, undefined | Edge>

export type t = RadixTrie

/** @returns shared prefix length. */
const shared =
  (lhs: string, rhs: string, rhsOffset = 0) => {
    const n = Math.min(lhs.length, rhs.length - rhsOffset)
    for (let i = 0; i < n; i++) {
      if (lhs[i] !== rhs[rhsOffset + i]) {
        return i
      }
    }
    return n
  }

export const insert =
  (trie: t, value: string) => {
    const char = value[0]
    const edge = trie[char]
    if (!edge) {
      trie[char] = { P: value, E: true }
      return
    }
    const n = shared(edge.P, value)

    // If prefix matches edge's prefix...
    if (n === edge.P.length) {

      // If common prefix is the entire value, mark as end of string.
      if (n === value.length) {
        edge.E = true
        return
      }

      const suffix = value.slice(n)
      const suffixChar = suffix[0]

      // If edge doesn't have node, create one.
      if (!edge.N) {
        edge.N = { [suffixChar]: { P: suffix, E: true } }
        return
      }

      // Otherwise insert suffix into node.
      insert(edge.N, suffix)
      return
    }

    const prefix = edge.P.slice(0, n)
    const suffix = edge.P.slice(n)
    const suffixChar = suffix[0]

    // Split.
    edge.N = { [suffixChar]: { P: suffix, N: edge.N, E: edge.E } }
    edge.P = prefix
    edge.E = false

    insert(edge.N, value.slice(n))
  }

export const empty =
  (): t =>
    ({})

export const of =
  (values: Iterable<string> = []): t => {
    const trie = empty()
    for (const value of values) {
      insert(trie, value)
    }
    return trie
  }

export const prefixLengths =
  function* (trie: t, input: string, offset = 0): Generator<number> {
    const char = input[offset]
    const edge = trie[char]
    if (!edge) {
      return
    }
    const n = edge.P.length
    if (shared(edge.P, input, offset) === n) {
      if (edge.E) {
        yield n
      }
      if (edge.N) {
        for (const prefixLength of prefixLengths(edge.N, input, offset + n)) {
          yield n + prefixLength
        }
      }
    }
  }

/** @yields trie entries which are input's prefixes from the shortest to the longest. */
export const prefixes =
  function* (trie: t, input: string, offset = 0): Generator<string> {
    for (const prefixLength of prefixLengths(trie, input, offset)) {
      yield input.slice(offset, offset + prefixLength)
    }
  }

export const firstPrefixLength =
  (trie: t, input: string, offset = 0) => {
    for (const prefixLength of prefixLengths(trie, input, offset)) {
      return prefixLength
    }
    return 0
  }

export const firstPrefix =
  (trie: t, input: string, offset = 0) => {
    const firstLength = firstPrefixLength(trie, input, offset)
    return firstLength === 0 ?
      undefined :
      input.slice(offset, offset + firstLength)
  }

export const longestPrefixLength =
  (trie: t, input: string, offset = 0) => {
    let longestLength = 0
    for (const prefixLength of prefixLengths(trie, input, offset)) {
      if (prefixLength > longestLength) {
        longestLength = prefixLength
      }
    }
    return longestLength
  }

export const longestPrefix =
  (trie: t, input: string, offset = 0) => {
    const length = longestPrefixLength(trie, input, offset)
    return length === 0 ?
      undefined :
      input.slice(offset, offset + length)
  }

export const has =
  (trie: t, input: string, offset = 0): boolean => {
    const char = input[offset]
    const edge = trie[char]
    if (!edge) {
      return false
    }
    const n = edge.P.length
    return shared(edge.P, input, offset) === n ?
      input.length === offset + n ?
        edge.E :
        edge.N ?
          has(edge.N, input, offset + n) :
          false :
        false
  }
