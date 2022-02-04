import { IPerson } from "./person.interface";

export interface IPeopleWrapper {
    [key: string]: (IPerson | IPerson[])
}