import { Pipe, PipeTransform } from "@angular/core";


@Pipe({name: 'syncOpTransform'})
export class SyncOpTransformPipe implements PipeTransform {
    register = {
        NO_TASK: 'Nothing to do.',
        UNKNOWN: 'Status unknown',
        PENDING: 'Sync operation is pending within EBI infrastructure.',
        RUNNING: 'Sync operation is underway within EBI infrastructure.',
        START_FAILURE: 'Sync operation failed to start.',
        SYNC_FAILURE: 'Sync operation failed to transfer files from FTP folder.',
        COMPLETED_SUCCESS: 'Sync operation completed successfully.'

    }

    transform(value: string): string {
        return this.register[value]
    }
}