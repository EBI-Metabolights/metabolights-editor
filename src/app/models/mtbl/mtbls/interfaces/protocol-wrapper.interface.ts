import { IProtocol } from "./protocol.interface";

export interface IProtocolWrapper {
    /**Using an index signature parameter type as the key will either be protocol or protocols and I didnt
     * want to write two nearly identical interfaces.
     */
    [key: string]: (IProtocol | IProtocol[])
    
}

