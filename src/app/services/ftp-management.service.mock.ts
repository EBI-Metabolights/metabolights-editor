import { merge, Observable, of } from "rxjs";
import { delay, mapTo } from "rxjs/operators";
import { FTPResponse } from "../models/mtbl/mtbls/interfaces/generics/ftp-response.interface";
import { GenericHttpResponse } from "../models/mtbl/mtbls/interfaces/generics/generic-http-response.interface";

export class MockFtpManagementService {

    synchronise(): Observable<GenericHttpResponse> {
        return of({status: 'this is a test response'})
    }

    public getSyncStatus() {
        let nothing = of(null);
        let obj = {
            status: 'RUNNING',
            description: '',
            last_update_time: 'October 31st 1970'
        }
        let observable = merge(
            nothing.pipe(mapTo(obj), delay(2000))
        )
        return observable
    }
}
