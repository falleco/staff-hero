import { describe, expect, it } from 'vitest';
import { chunkNoteStatuses } from '../rhythm-layout';

describe('chunkNoteStatuses', () => {
  it('splits items into equally sized chunks', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = chunkNoteStatuses(items, 2);
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('leaves a shorter chunk when items do not divide evenly', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = chunkNoteStatuses(items, 3);
    expect(result).toEqual([['a', 'b', 'c'], ['d', 'e']]);
  });

  it('throws when size is zero or negative', () => {
    expect(() => chunkNoteStatuses([1, 2], 0)).toThrowError(
      /greater than zero/,
    );
  });
});
