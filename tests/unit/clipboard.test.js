import { describe, expect, it, vi } from 'vitest';
import { copyAddress } from '../../src/clipboard.js';

describe('copying a contact address', () => {
  const address = 'portfolio@example.com';

  it('reports success only after writing the exact address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyAddress({ writeText }, address)).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledExactlyOnceWith(address);
  });

  it('handles a missing clipboard API', async () => {
    await expect(copyAddress(undefined, address)).resolves.toBe('unavailable');
  });

  it('handles permission denial without claiming success', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    await expect(copyAddress({ writeText }, address)).resolves.toBe(
      'unavailable',
    );
  });
});
