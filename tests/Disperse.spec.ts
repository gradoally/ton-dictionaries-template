import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, fromNano } from '@ton/core';
import { Disperse } from '../wrappers/Disperse';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { time } from 'console';

describe('Disperse', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Disperse');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let disperseContract: SandboxContract<Disperse>;

    beforeEach(async () => {

        blockchain = await Blockchain.create();
        blockchain.now = 100;

        deployer = await blockchain.treasury('deployer');

        disperseContract = blockchain.openContract(
            Disperse.createFromConfig(
                {
                    owner_addr: deployer.address,
                },
                code
            )
        );

        const deployResult = await disperseContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: disperseContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and counter are ready to use
    });

    it('should add wallet', async () => {

        let wallet_arr = await blockchain.createWallets(5);

        const balance = await deployer.getBalance();
        console.log(`Deployer Balance: ${fromNano(balance)}`);

        // let i = 0;
        for (let i = 0; i < wallet_arr.length; i++) {     
            const walletCountBefore = await disperseContract.getWalletCount();
            console.log(`wallet account before adding: ${walletCountBefore}`);

            console.log(`adding ${wallet_arr[i].address}`);
            const addResult = await disperseContract.sendAddWallet(deployer.getSender(), {
                wallet_addr: wallet_arr[i].address,
                value: toNano('1'),
            });

            expect(addResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: disperseContract.address,
                success: true,
            });

            const walltCountAfter = await disperseContract.getWalletCount();
            console.log(`wallet count after adding: ${walltCountAfter}`);

            expect(walltCountAfter).toBe(walletCountBefore + 1);
        }

        let wallets = await disperseContract.getWallets();
        const resultArray = [];
        while (wallets.remaining) {
            resultArray.push(wallets.readAddress());
        }
        console.log(resultArray);
    });
});
