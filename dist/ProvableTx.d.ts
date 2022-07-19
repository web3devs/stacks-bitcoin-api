/// <reference types="node" />
import { BufferCV } from "@stacks/transactions";
export default class ProvableTx {
    private readonly tx;
    private readonly txId;
    private readonly txIndex;
    private readonly stxBlockHeight;
    private readonly blockHeader;
    private readonly proof;
    private readonly txDetail;
    private readonly blockDetail;
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
