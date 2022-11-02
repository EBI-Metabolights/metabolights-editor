import { Observable, of } from "rxjs";
import { FTPResponse } from "../models/mtbl/mtbls/interfaces/generics/ftp-response.interface";
import { GenericHttpResponse } from "../models/mtbl/mtbls/interfaces/generics/generic-http-response.interface";

export class MockFtpManagementService {

    synchronise(): Observable<GenericHttpResponse> {
        return of({status: 'this is a test response'})
    }

    getSyncStatus(): Observable<FTPResponse> {
        return of({
            status: 'RUNNING',
            description: '',
            last_update_time: 'October 31st 1970'

        })
    }

    syncCalculation(): Observable<FTPResponse> {
        return of({
            status: 'SYNC_NEEDED',
            description: 'file_to_sync.txt',
            last_update_time: 'October 31st 1970'
        })
    }
}