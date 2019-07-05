const { get } = require('lodash');

const calculateBucket = require('./calculate-bucket');

module.exports = (togglestate, togglename, { uuid, culture, forcedToggles }) => {
    if (forcedToggles && togglename in forcedToggles) {
        return forcedToggles[togglename];
    }

    const toggles = get(togglestate, 'toggles', []);
    const toggle = toggles.find(({ id }) => id === togglename);

    const rolloutCultures = get(toggle, 'activations.0.attributes.culture', []);
    if (rolloutCultures.length > 0 && !rolloutCultures.includes(culture)) {
        return false;
    }

    const rolloutPercentage = get(toggle, 'activations.0.rollout.percentage', 0);
    if (rolloutPercentage === 100) {
        return true;
    }

    if (uuid) {
        const bucket = calculateBucket(uuid);
        return rolloutPercentage >= bucket;
    }

    return false;
};
