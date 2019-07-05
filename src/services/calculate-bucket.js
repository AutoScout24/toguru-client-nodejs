const BN = require('bn.js');

// This calculation is broken.
// Normally we would calculate with new BN(x).mod(new BN(100)).toNumber() + 1;
// BUT: the existing scala client is doing strange calculation.
// See thread here: https://github.com/Scout24/toguru-scala-client/pull/27
module.exports = (uuid) => {
    // in case of errors with the uuid we need a fallback value
    // we set it to 100 so that the feature is still rolled out to all users when the rollout percentage is at 100
    const FALLBACK_BUCKET_COUNT = 100;

    if (!uuid) {
        return FALLBACK_BUCKET_COUNT;
    }

    const strippedUUID = uuid.replace(/-/g, '');
    const isUUIDInvalid = strippedUUID.length !== 32;

    if (isUUIDInvalid) {
        return FALLBACK_BUCKET_COUNT;
    }

    const hi = new BN(strippedUUID.substr(0, 16), 16);
    const lo = new BN(strippedUUID.substr(16, 16), 16);

    const bucketCount =
        lo
            .shln(64)
            .add(hi)
            .fromTwos(128)
            .mod(new BN(100))
            .toNumber() + 1;

    if (bucketCount < 0) {
        return 100 + bucketCount;
    }

    return bucketCount;
};
