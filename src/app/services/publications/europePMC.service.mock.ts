
export class MockEuropePMCService {


    getArticleInfo() {
        return {
            'title': "",
            'authorList': "",
            'authorDetails': "",
            'pubMedID': "",
            'doi': "",
            'abstract': ""
        }
    }


    getArticleKeywords() {
        return {
            'keywords': ['keywords']
        }
    }
}