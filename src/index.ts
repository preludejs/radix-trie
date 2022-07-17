
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
  (values: string[] = []): t => {
    const trie = empty()
    for (const value of values) {
      insert(trie, value)
    }
    return trie
  }

/** @yields trie entries which are input's prefixes from the shortest to the longest. */
export const prefixes =
  function* (trie: t, input: string, offset = 0) {
    const char = input[offset]
    const edge = trie[char]
    if (!edge) {
      return
    }
    const n = edge.P.length
    if (shared(edge.P, input, offset) === n) {
      if (edge.E) {
        yield edge.P
      }
      if (edge.N) {
        for (const prefix of prefixes(edge.N, input, offset + n)) {
          yield edge.P + prefix
        }
      }
    }
  }

export const longestPrefix =
  (trie: t, input: string) => {
    let longest: undefined | string
    for (const prefix of prefixes(trie, input)) {
      longest = prefix
    }
    return longest
  }
