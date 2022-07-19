import {Buffer} from "buffer";
import {reverseBuffer} from "../lib/Utils";

console.assert(
    reverseBuffer(Buffer.from('00010203', 'hex'))
        .equals(Buffer.from('03020100', 'hex')),
    'Reverse buffer failed'
)
