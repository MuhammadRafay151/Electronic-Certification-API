/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const helper = require('./helper');
var config = require('config');
var UserOrg = config.get("App.org");
async function GetCertificate(userid, certificate_key) {
    try {
        
        // load the network configuration

        const ccp = await helper.getCCP(UserOrg)

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(UserOrg);
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
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('ecert');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        try {
            const result = await contract.evaluateTransaction('queryCertificates', certificate_key);
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            return result.toString()
        }
        catch {
            console.log("No Certificate found");
            return false
        }

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
module.exports={GetCertificate:GetCertificate};
