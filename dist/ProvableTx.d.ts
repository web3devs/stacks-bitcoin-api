/// <reference types="node" />
import { BufferCV } from '@stacks/transactions';
export default class ProvableTx {
    readonly tx: Buffer;
    readonly txId: Buffer;
    readonly txIndex: number;
    readonly stxBlockHeight: number;
    readonly blockHeader: Buffer;
    readonly proof: Buffer[];
    readonly txDetail: any;
    readonly blockDetail: any;
    private constructor();
    static fromTxId(txId: string | Buffer): Promise<ProvableTx>;
    toCompactProofCV(): {
        compactHeader: import("@stacks/transactions/dist/clarity/types/tupleCV.js").TupleCV<{
            [key: string]: BufferCV | import("@stacks/transactions/dist/clarity/types/intCV.js").UIntCV;
        }>;
        tx: BufferCV;
        proof: import("@stacks/transactions/dist/clarity/types/tupleCV.js").TupleCV<{
            [key: string]: import("@stacks/transactions/dist/clarity/types/intCV.js").UIntCV | import("@stacks/transactions/dist/clarity/types/listCV.js").ListCV<BufferCV>;
        }>;
    };
    toProofCV(): {
        header: import("@stacks/transactions/dist/clarity/types/tupleCV.js").TupleCV<{
            [key: string]: BufferCV | import("@stacks/transactions/dist/clarity/types/intCV.js").UIntCV;
        }>;
        tx: BufferCV;
        proof: import("@stacks/transactions/dist/clarity/types/tupleCV.js").TupleCV<{
            [key: string]: import("@stacks/transactions/dist/clarity/types/intCV.js").UIntCV | import("@stacks/transactions/dist/clarity/types/listCV.js").ListCV<BufferCV>;
        }>;
    };
    private getHeaderCV;
    private getProofCV;
    private getCompactHeaderCV;
}
