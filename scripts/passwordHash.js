const bcrypt = require('bcrypt');

const RAW_PASSWORD = 'TODO';

bcrypt.hash(RAW_PASSWORD, 10, function(err, hash) {
    // Store hash in the database
    console.log('Hashed password: ', hash);
});
