const { get } = require('lodash');

const toggleBelongsToService = (toggle, serviceName) => {
    const service = get(toggle, 'tags.service', '').split(',');
    const services = get(toggle, 'tags.services', '').split(',');

    return service.concat(services).includes(serviceName);
};

module.exports = (togglestate, service) => {
    const toggles = get(togglestate, 'toggles', []);
    const togglesForService = toggles.filter((t) => toggleBelongsToService(t, service));

    return togglesForService.map((t) => t.id);
};
