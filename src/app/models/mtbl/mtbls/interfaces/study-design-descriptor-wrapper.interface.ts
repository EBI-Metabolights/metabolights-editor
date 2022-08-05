import { IStudyDesignDescriptor } from "./study-design-descriptor.interface";

export interface IStudyDesignDescriptorWrapper {
    [key: string]: IStudyDesignDescriptor | IStudyDesignDescriptor[]
}