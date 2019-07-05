const fetchTogglestate = require('./services/fetch-togglestate');
const isToggleEnabledForUser = require('./services/is-toggle-enabled');
const findToggleListForService = require('./services/find-toggle-list-for-service');

module.exports = ({ endpoint, refreshInterval = 60000 }) => {
    let toggleState = {};

    fetchTogglestate(endpoint).then((ts) => (toggleState = ts));
    setInterval(() => {
        fetchTogglestate(endpoint).then((ts) => (toggleState = ts));
    }, refreshInterval);

    return {
        isToggleEnabled: (toggleName, { uuid, culture, forcedToggles }) => {
            return isToggleEnabledForUser(toggleState, toggleName, {
                uuid,
                culture,
                forcedToggles,
            });
        },

        toggleNamesForService: (service) => {
            return findToggleListForService(toggleState, service);
        },

        togglesForService: (service, user) => {
            const result = {};
            const toggles = findToggleListForService(toggleState, service);
            toggles.forEach((t) => {
                result[t] = isToggleEnabledForUser(toggleState, t, user);
            });

            return result;
        },
    };
};
