import { IPublication } from "./publication.interface";

export interface IPublicationWrapper {
    [key: string]: (IPublication | IPublication[])
}