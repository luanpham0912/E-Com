import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeDate,
  slugify,
  generateId,
  getInitials,
} from '../lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('overrides tailwind classes with last wins', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toContain('text-blue-500');
  });
});

describe('formatCurrency', () => {
  it('formats positive amounts as USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('formats with custom currency', () => {
    const result = formatCurrency(99.99, 'EUR');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDate', () => {
  it('formats ISO string to long date', () => {
    const result = formatDate('2024-03-15T10:00:00Z');
    expect(result).toMatch(/March 15, 2024/);
  });
});

describe('formatRelativeDate', () => {
  it('returns Today for same day', () => {
    const today = new Date().toISOString();
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('returns Yesterday for previous day', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns days ago for less than a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('returns weeks ago for less than a month', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago');
  });
});

describe('slugify', () => {
  it('converts normal text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('removes leading dashes', () => {
    expect(slugify('  Hello')).toBe('hello');
  });

  it('removes trailing dashes', () => {
    expect(slugify('Hello  ')).toBe('hello');
  });
});

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique ids on consecutive calls', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('getInitials', () => {
  it('returns single initial for single word name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('returns two initials for multi-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('uppercases all letters', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('John Paul Smith')).toBe('JP');
  });
});
