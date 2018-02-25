module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    ropsten: {
        network_id: 3,
        host: "127.0.0.1",
        port:  8545,
        gas: 4600000
    }
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	}
};