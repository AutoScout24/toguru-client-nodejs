const axios = require('axios');

module.exports = (endpoint) =>
    axios({
        url: endpoint,
        headers: {
            Accept: 'application/vnd.toguru.v3+json',
        },
        dataType: 'json',
    }).then(({ data }) => data);
