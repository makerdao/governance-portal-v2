var ganache = require('ganache-cli');
const port = 2000;
const options = {
  network_id: 999,
  total_accounts: 100,
  mnemonic: 'hill law jazz limb penalty escape public dish stand bracket blue jar',
  db_path: './ganache/var/chaindata'
};
var server = ganache.server(options);
server.listen(port);
