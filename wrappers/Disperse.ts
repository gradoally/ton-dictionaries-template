import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from '@ton/core';
export const Op = {
    add_w: 0,
    add_jw: 1,
    transfer: 2,
    j_transfer: 4, };
export type Vars = { OwnerAddress: Address, };
export function VarsToCell(vars: Vars): Cell { return beginCell()
    .storeAddress(vars.OwnerAddress)
    .storeDict(Dictionary.empty(Dictionary.Keys.BigInt(32), Dictionary.Values.Address()))
    .storeDict(Dictionary.empty(Dictionary.Keys.BigInt(32), Dictionary.Values.Address()))
    .endCell(); }
export class Disperse implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}
    static createFromAddress(address: Address) { return new Disperse(address); }
    static createFromConfig(vars: Vars, code: Cell, workchain = 0) {
        const data = VarsToCell(vars);
        const init = { code, data };
        return new Disperse(contractAddress(workchain, init), init); }
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) { await provider.internal(via, {
        value, sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().endCell(), }); }
    async sendAddWallet(provider: ContractProvider,
        via: Sender, wallet_addr: Address, value: bigint, queryID?: number,
        ) { await provider.internal(via, {
        value: value, sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(Op.add_w, 32).storeUint(queryID ?? 0, 64).storeAddress(wallet_addr).endCell(), }); }
    async getOwnerAddr(provider: ContractProvider) {
        const result = await provider.get('get_owner_addr', []);
        return result.stack.readAddress(); }
    async getWallets(provider: ContractProvider) {
        const result = await provider.get('get_wallets', []);
        return result.stack.readCellOpt(); }
    async getWalletByIndex(provider: ContractProvider) {
        const result = await provider.get('get_wallet_by_index', []);
        return result.stack.readAddress(); } }
