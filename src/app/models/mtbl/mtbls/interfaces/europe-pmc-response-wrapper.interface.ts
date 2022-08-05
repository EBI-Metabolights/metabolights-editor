export interface IEuropePMCResponseWrapper {
    resultList: {
        result: IEuropePMCResult[];
    }
}

export interface IEuropePMCResult {
    title: string;
    authorList: string | string[];
    pmid: string;
    doi: string;
    abstractText: string;
    keywordList: IKeywordList;

}

export interface IKeywordList {
    keyword: string[]
}