const findToggleListForService = require('../src/services/find-toggle-list-for-service');
const toggleState = require('./togglestate.fixture.json');

describe('Find Toggle Names for Service', () => {
    it('works', () => {
        expect(findToggleListForService(toggleState, 'service1')).toEqual(['rolled-out-to-none-not-even-in-de']);
        expect(findToggleListForService(toggleState, 'service2')).toEqual([
            'rolled-out-to-half-in-de-only',
            'rolled-out-to-noone',
        ]);
    });
});
