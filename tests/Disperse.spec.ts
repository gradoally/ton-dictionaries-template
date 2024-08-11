import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Disperse } from '../wrappers/Disperse';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Disperse', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Disperse');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let disperse: SandboxContract<Disperse>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        disperse = blockchain.openContract(Disperse.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await disperse.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: disperse.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and disperse are ready to use
    });
});
