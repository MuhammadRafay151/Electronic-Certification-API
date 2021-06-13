/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const helper = require('./helper');

async function PublishCertificate(cert, userid) {
    let ccp = await helper.getCCP();

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'org1-wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    // console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userid);
    if (!identity) {
        await helper.getRegisteredUser(userid)
        // console.log('An identity for the user so we are creating identity');

    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: true, asLocalhost: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('ecert');

    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')

    await contract.submitTransaction('PublishCertificate', JSON.stringify(cert));
    // console.log('Transaction has been submitted');
    // Disconnect from the gateway.
    await gateway.disconnect();
}
async function PublishBatch(batch, userid) {
    let ccp = await helper.getCCP();

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'org1-wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    // console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userid);
    if (!identity) {
        await helper.getRegisteredUser(userid)
        // console.log('An identity for the user so we are creating identity');

    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: true, asLocalhost: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('ecert');

    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')

    await contract.submitTransaction('PublishBatch', JSON.stringify(batch));
    // console.log('Transaction has been submitted');
    // Disconnect from the gateway.
    await gateway.disconnect();
}
//console.log(helper.getCCP("Org1"));

module.exports = { singleInvoke: PublishCertificate, batchInvoke: PublishBatch };