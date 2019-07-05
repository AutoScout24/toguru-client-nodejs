const cookie = require('cookie');
const Client = require('./client');

const qs = require('qs');
const setCookieParser = require('set-cookie-parser');
const { get, mapValues } = require('lodash');

const getCookieValueFromResponseHeader = (res, cookieName) => {
    if (!res || !res.getHeader) {
        return null;
    }

    const cookies = setCookieParser.parse(res.getHeader('set-cookie'));
    const cookie = cookies.find((c) => c.name === cookieName);
    if (!cookie) {
        return null;
    }

    return cookie.value;
};

/**
 * @param endpoint - endpoint to the list of toggle states
 * @param refreshInterval - interval time to fetch and update toggle state list (in ms)
 * @param cookieName - name of the cookie containing the uuid for bucketing the user
 * @param cultureCookieName - name of the cookie containing the user culture value
 */

module.exports = ({ endpoint, refreshInterval = 60000, cookieName, cultureCookieName }) => {
    const client = Client({
        endpoint,
        refreshInterval,
    });

    return async (req, res, next) => {
        try {
            const cookiesRaw = get(req, 'headers.cookie', '');
            const cookies = cookie.parse(cookiesRaw);

            const uuid = cookies[cookieName] || getCookieValueFromResponseHeader(res, cookieName);
            const culture = cookies[cultureCookieName] || getCookieValueFromResponseHeader(res, cultureCookieName);

            const forcedTogglesRaw = Object.assign(
                {},
                qs.parse(cookies.toguru),
                qs.parse((req.query && req.query.toguru) || '', {
                    delimiter: '|',
                }),
            );

            const forcedToggles = mapValues(forcedTogglesRaw, (toggleValue) => toggleValue === 'true');

            req.toguru = {
                isToggleEnabled: (toggleName) =>
                    client.isToggleEnabled(toggleName, {
                        uuid,
                        culture,
                        forcedToggles,
                    }),
                togglesForService: (service) =>
                    client.togglesForService(service, {
                        uuid,
                        culture,
                        forcedToggles,
                    }),
                toggleNamesForService: (service) => client.toggleNamesForService(service),

                toggleStringForService: (service) => {
                    const toggles = client.togglesForService(service, {
                        uuid,
                        culture,
                        forcedToggles,
                    });
                    return `toguru=${encodeURIComponent(qs.stringify(toggles, { delimiter: '|' }))}`;
                },
            };
        } catch (ex) {
            req.toguru = {
                isToggleEnabled: () => true,
                togglesForService: () => [],
                toggleNamesForService: () => [],
                toggleStringForService: () => '',
            };
            console.warn('Error in Toguru Client:', ex);
        } finally {
            next();
        }
    };
};
