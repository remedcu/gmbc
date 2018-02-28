module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    ropsten: {
      network_id: 3,
      host: "192.168.1.23",
      port:  8545,
      gas: 4600000
    },
    temp: {
      
    }
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	}
};