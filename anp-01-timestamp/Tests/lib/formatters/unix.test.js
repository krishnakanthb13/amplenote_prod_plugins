import { unix } from '../../../lib/formatters/unix.js';

describe('unix', () => {
    let app;

    beforeEach(() => {
        app = {};
    });

    test('should return current unix timestamp as string', () => {
        const now = Math.floor(Date.now() / 1000);
        const result = unix(app);
        const val = parseInt(result, 10);

        // Allow for small time difference
        expect(val).toBeGreaterThanOrEqual(now);
        expect(val).toBeLessThan(now + 5);
    });
});
