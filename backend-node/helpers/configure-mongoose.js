'use strict';

module.exports = function configureMongoose(mongoose) {
    if (!mongoose || typeof mongoose.set !== 'function') return mongoose;
    // useFindAndModify and useCreateIndex are obsolete and unsupported in Mongoose 6+
    return mongoose;
};
