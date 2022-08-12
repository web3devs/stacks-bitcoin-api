/// <reference types="node" />
import { BufferCV } from '@stacks/transactions';
import { Buffer } from 'buffer';
import BN from 'bn.js';
export declare type Range = {
    min: number;
    max: number;
};
export declare enum RangeComparison {
    Above = 1,
    Below = -1,
    Contained = 0
}
export declare const compareToRange: (i: number, { min, max }: Range) => RangeComparison;
export declare const reverseBuffer: (buffer: Buffer) => Buffer;
export declare const cvToBuffer: (cv: BufferCV) => Buffer;
export declare const numberToBufferLE: (value: BN | number | string, size?: number) => Buffer;
export declare const hexOrBufferToHex: (hob: string | Buffer) => string;
export declare const hexOrBufferToBuffer: (hob: string | Buffer) => Buffer;
