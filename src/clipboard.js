/** @typedef {'copied' | 'unavailable'} CopyStatus */

/**
 * @param {Pick<Clipboard, 'writeText'> | undefined} clipboard
 * @param {string} address
 * @returns {Promise<CopyStatus>}
 */
export async function copyAddress(clipboard, address) {
  if (!clipboard) return 'unavailable';
  try {
    await clipboard.writeText(address);
    return 'copied';
  } catch {
    return 'unavailable';
  }
}
