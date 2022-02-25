
export class MockDOIService {

    getArticleInfo() {
        return {
            'title': 'some suitable title befitting the context',
            'authorList': ['Jane Doe', 'Her husband, John']
        }
    }

    getArticleKeywords() {
        return {
            'keywords': ['keywords']
        }
    }


}