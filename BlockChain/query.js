/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const { Gateway, Wallets } = require('fabric-network');
const helper = require('./helper');
const userid = "admin"
async function GetCertificate(certificate_key) {
    try {

        // load the network configuration

        const ccp = await helper.getCCP()

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath();
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userid);
        if (!identity) {
            console.log('An identity for the user  does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('ecert');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('QueryCertificate', certificate_key);
       // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        await gateway.disconnect();
        return result.toString()
        // Disconnect from the gateway.


    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        //await gateway.disconnect();
        // process.exit(1);
    }
}
module.exports = { GetCertificate: GetCertificate };
