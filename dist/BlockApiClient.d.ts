import _ from 'lodash';
declare function __getStxBlockHeight(bitcoinBlockHeight: number): Promise<number | undefined>;
export declare const getStxBlockHeight: typeof __getStxBlockHeight & _.MemoizedFunction;
export {};
