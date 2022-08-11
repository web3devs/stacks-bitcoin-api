import 'dotenv/config';
import { Buffer } from 'buffer';
export declare const getTransactionDetails: (txid: string | Buffer) => Promise<any>;
export declare const getRawBlockHeader: (blockhash: string | Buffer) => Promise<any>;
export declare const getBlockStats: (blockhash: string | Buffer) => Promise<any>;
