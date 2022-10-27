/**
 * This is a bit of a cop-out, as the actual response from the crossref API does in fact have known fields. But there are so many,
 * and we make use of so few of them, that I saw little point in spending what would likely be an hour populating an interface to
 * mirror this response. If this is objectionable to anyone, I will do my penance, and write the full fat interface.
 */
export interface ICrossRefDOI {
  [key: string]: any;
}
