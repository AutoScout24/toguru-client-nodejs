const expressMiddleware = require('../src/express-middleware');

const mockedTogglestate = require('./togglestate.fixture.json');

jest.mock('axios', () => {
    return jest.fn().mockImplementation(() => Promise.resolve({ data: mockedTogglestate }));
});

const sendRequest = async ({ uuid, culture, query }) => {
    const fakeRequest = {
        headers: {
            cookie: `uid=${uuid};culture=${culture}`,
        },
        query: query || {},
    };

    const fakeNext = jest.fn();

    await expressMiddleware({
        cookieName: 'uid',
        cultureCookieName: 'culture',
    })(fakeRequest, null, fakeNext);

    return fakeRequest;
};

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
// const userInBucket76CultureIT = { culture: 'it-IT', uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317' }; // bucket: 76

describe('Express middleware', () => {
    it('userInBucket22CultureDE', async () => {
        const req = await sendRequest(userInBucket22CultureDE);
        expect(req.toguru).toBeDefined();
        expect(req.toguru.isToggleEnabled('rolled-out-to-everyone')).toBe(true);
        expect(req.toguru.isToggleEnabled('rolled-out-to-half-in-de-only')).toBe(true);
    });

    it('userInBucketb76CultureDE', async () => {
        const req = await sendRequest(userInBucketb76CultureDE);
        expect(req.toguru).toBeDefined();
        expect(req.toguru.isToggleEnabled('rolled-out-to-noone')).toBe(false);
        expect(req.toguru.isToggleEnabled('rolled-out-to-half-in-de-only')).toBe(false);
    });

    it('togglesForService 1', async () => {
        const req = await sendRequest(userInBucket22CultureDE);
        expect(req.toguru.togglesForService('service2')).toEqual({
            'rolled-out-to-half-in-de-only': true,
            'rolled-out-to-noone': false,
        });
    });

    it('togglesForService 2', async () => {
        const req = await sendRequest(userInBucket22CultureIT);
        expect(req.toguru.togglesForService('service2')).toEqual({
            'rolled-out-to-half-in-de-only': false,
            'rolled-out-to-noone': false,
        });
    });

    it('toggleStringForService', async () => {
        const req = await sendRequest(userInBucket22CultureIT);
        expect(req.toguru.toggleStringForService('service2')).toEqual(
            'toguru=rolled-out-to-half-in-de-only%3Dfalse%7Crolled-out-to-noone%3Dfalse',
        );
    });

    it('Forced toggles', async () => {
        const req = await sendRequest({
            ...userInBucketb76CultureDE,
            query: {
                toguru: 'rolled-out-to-noone=true|rolled-out-to-half-in-de-only=true',
            },
        });
        expect(req.toguru).toBeDefined();
        expect(req.toguru.isToggleEnabled('rolled-out-to-noone')).toBe(true);
        expect(req.toguru.isToggleEnabled('rolled-out-to-half-in-de-only')).toBe(true);
    });
});
