
/** Radix trie. */
export type t =
  Record<string, undefined | {

    /** End of string. */
    E: boolean,

    /** Prefix. */
    P: string,

    /** Node. */
    N?: t

  }>

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

/**
 * Inserts a string into a radix trie.
 * @param mutableTrie - The trie to modify
 * @param value - The string to insert
 */
export const insert =
  (mutableTrie: t, value: string) => {

    // Special case for empty string
    if (value.length === 0) {
      if (mutableTrie[''] == null) {
        mutableTrie[''] = { P: '', E: true }
      }
      return
    }

    const char = value[0]
    const edge = mutableTrie[char]
    if (!edge) {
      mutableTrie[char] = { P: value, E: true }
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

    // Split.
    {
      const prefix = edge.P.slice(0, n)
      const suffix = edge.P.slice(n)
      const suffixChar = suffix[0]

      edge.N = { [suffixChar]: { P: suffix, N: edge.N, E: edge.E } }
      edge.P = prefix

      // If the prefix being created is the same as the value being inserted, then mark it as an end of string.
      // Otherwise, keep it as not an end of string.
      edge.E = (prefix === value)

      insert(edge.N, value.slice(n))
    }
  }

/**
 * Creates an empty radix trie.
 * @returns A new empty radix trie
 */
export const empty =
  (): t =>
    ({})

/**
 * Creates a radix trie from a collection of strings.
 * @param values - The strings to insert into the trie
 * @returns A new radix trie containing the provided values
 */
export const of =
  (values: Iterable<string> = []): t => {
    const trie = empty()
    for (const value of values) {
      insert(trie, value)
    }
    return trie
  }

/**
 * Yields the lengths of all prefixes of the input string that exist in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to find prefixes for
 * @param offset - The starting offset in the input string
 * @yields The lengths of all prefixes found in the trie
 */
export const prefixLengths =
  function* (trie: t, input: string, offset = 0): Generator<number> {

    // Special case for empty string as a prefix.
    if (trie['']?.E === true && offset <= input.length) {
      yield 0
    }

    // If we're at the end of the input, no more prefixes to find.
    if (offset >= input.length) {
      return
    }

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

/**
 * Yields all prefixes of the input string that exist in the trie.
 * Yields prefixes from the shortest to the longest.
 * @param trie - The radix trie to search in
 * @param input - The string to find prefixes for
 * @param offset - The starting offset in the input string
 * @yields The prefixes found in the trie from shortest to longest
 */
export const prefixes =
  function* (trie: t, input: string, offset = 0): Generator<string> {
    for (const prefixLength of prefixLengths(trie, input, offset)) {
      yield input.slice(offset, offset + prefixLength)
    }
  }

/**
 * Returns the length of the first prefix of the input string found in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to find a prefix for
 * @param offset - The starting offset in the input string
 * @returns The length of the first prefix found, or 0 if no prefix exists
 */
export const firstPrefixLength =
  (trie: t, input: string, offset = 0) => {
    for (const prefixLength of prefixLengths(trie, input, offset)) {
      return prefixLength
    }
    return 0
  }

/**
 * Returns the first prefix of the input string found in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to find a prefix for
 * @param offset - The starting offset in the input string
 * @returns The first prefix found, or undefined if no prefix exists
 */
export const firstPrefix =
  (trie: t, input: string, offset = 0) => {
    const firstLength = firstPrefixLength(trie, input, offset)
    return firstLength === 0 ?
      undefined :
      input.slice(offset, offset + firstLength)
  }

/**
 * Returns the length of the longest prefix of the input string found in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to find a longest prefix for
 * @param offset - The starting offset in the input string
 * @returns The length of the longest prefix found, or 0 if no prefix exists
 */
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

/**
 * Returns the longest prefix of the input string found in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to find a longest prefix for
 * @param offset - The starting offset in the input string
 * @returns The longest prefix found, or undefined if no prefix exists
 */
export const longestPrefix =
  (trie: t, input: string, offset = 0) => {
    const length = longestPrefixLength(trie, input, offset)
    return length === 0 ?
      undefined :
      input.slice(offset, offset + length)
  }

/**
 * Checks if a string exists in the trie.
 * @param trie - The radix trie to search in
 * @param input - The string to check for
 * @param offset - The starting offset in the input string
 * @returns True if the string exists in the trie, false otherwise
 */
export const has =
  (trie: t, input: string, offset = 0): boolean => {

    // Special case for empty string.
    if (input.length === offset) {
      return trie['']?.E === true
    }

    const char = input[offset]
    const edge = trie[char]
    if (!edge) {
      return false
    }
    const n = edge.P.length
    if (shared(edge.P, input, offset) !== n) {
      return false
    }
    if (input.length === offset + n) {
      return edge.E
    }
    if (!edge.N) {
      return false
    }
    return has(edge.N, input, offset + n)
  }
