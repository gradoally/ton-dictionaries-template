import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export const Opcodes = {
    add_wallet: 0xf6e14824,
    add_jetton_wallet: 0x432ff932,
    transfer: 0x3ee943f1,
    transfer_jetton: 0x31733dc2,
};

export class Disperse implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Disperse(address);
    }

    static createFromConfig(code: Cell, workchain = 0) {
        const data = beginCell().endCell();
        const init = { code, data };
        return new Disperse(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32).storeUint(0, 64).endCell(),
        });
    }

    async sendAddWallet(
        provider: ContractProvider,
        via: Sender,
        opts: {
            wallet_addr: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.add_wallet, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.wallet_addr)
                .endCell(),
        });
    }

    async getOwnerAddr(provider: ContractProvider) {
        const result = await provider.get('get_owner_addr', []);
        return result.stack.readAddress();
    }

    async getWallets(provider: ContractProvider) {
        const result = await provider.get('get_wallets', []);
        return result.stack.readCellOpt();
    }

}
