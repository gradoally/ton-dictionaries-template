import { toNano, Address } from '@ton/core';
import { Disperse } from '../wrappers/Disperse';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const disperse = provider.open(
        Disperse.createFromConfig(await compile('Disperse'))
    );

    await disperse.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(disperse.address);

    // console.log('ID', await counter.getID());
}
