import { IFactor } from './factor.interface';

export interface IFactorsWrapper {
  [key: string]: IFactor | IFactor[];
}
