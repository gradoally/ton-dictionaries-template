import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type DisperseConfig = {};

export function disperseConfigToCell(config: DisperseConfig): Cell {
    return beginCell().endCell();
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
}
