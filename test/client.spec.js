const Client = require('../index');

const userInBucket22CultureDE = {
    culture: 'de-DE',
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
}; // bucket: 22
const userInBucketb76CultureDE = {
    culture: 'de-DE',
    uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
}; // bucket: 76
const userInBucket22CultureIT = {
    culture: 'it-IT',
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
}; // bucket: 22
// const userInBucket76CultureIT = {
//     culture: 'it-IT',
//     uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
// }; // bucket: 76

const mockedTogglestate = require('./togglestate.fixture.json');

jest.mock('axios', () => {
    return jest.fn().mockImplementation(() => Promise.resolve({ data: mockedTogglestate }));
});

describe('Toguru Client Usage', () => {
    it('Basic usage', async () => {
        const client = Client({
            endpoint: 'https://example.com/togglestate',
            refreshInterval: 60 * 1000,
        });

        await new Promise((resolve) => setTimeout(resolve));

        expect(client.isToggleEnabled('rolled-out-to-noone', userInBucket22CultureDE)).toBe(false);
        expect(
            client.isToggleEnabled('rolled-out-to-noone', {
                ...userInBucket22CultureDE,
                forcedToggles: { 'rolled-out-to-noone': true },
            }),
        ).toBe(true);
        expect(client.isToggleEnabled('rolled-out-to-everyone', userInBucketb76CultureDE)).toBe(true);
        expect(client.isToggleEnabled('rolled-out-only-in-de', userInBucket22CultureIT)).toBe(false);
        expect(client.isToggleEnabled('rolled-out-to-half-in-de-only', userInBucket22CultureDE)).toBe(true);
        expect(client.isToggleEnabled('rolled-out-to-half-in-de-only', userInBucket22CultureIT)).toBe(false);
    });

    it('Advanced features', async () => {
        const client = Client({
            endpoint: 'https://example.com/togglestate',
            refreshInterval: 60 * 1000,
        });

        await new Promise((resolve) => setTimeout(resolve));

        expect(client.togglesForService('service2', userInBucket22CultureDE)).toEqual({
            'rolled-out-to-half-in-de-only': true,
            'rolled-out-to-noone': false,
        });
    });
});
