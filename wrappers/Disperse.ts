import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export const Opcodes = {
    add_wallet: 0xf6e14824,
    add_jetton_wallet: 0x432ff932,
    transfer: 0x3ee943f1,
    transfer_jetton: 0x31733dc2,
};

export type DisperseConfig = {
    owner_addr: Address | undefined;
};

export function disperseConfigToCell(config: DisperseConfig): Cell {
    return beginCell()
        .storeAddress(config.owner_addr)
    .endCell();
}

export class Disperse implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Disperse(address);
    }

    static createFromConfig(config: DisperseConfig, code: Cell, workchain = 0) {
        const data = disperseConfigToCell(config);
        const init = { code, data };
        return new Disperse(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
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

    async getWalletCount(provider: ContractProvider) {
        const result = await provider.get('get_wallet_count', []);
        return result.stack.readNumber();
    }

    async getWallets(provider: ContractProvider) {
        const result = await provider.get('get_wallets', []);
        return result.stack.readTuple();
    }

    async getJettonWalletCount(provider: ContractProvider) {
        const result = await provider.get('get_jetton_wallet_count', []);
        return result.stack.readNumber();
    }
}
