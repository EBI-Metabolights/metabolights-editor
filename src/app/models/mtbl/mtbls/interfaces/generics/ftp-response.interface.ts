/* eslint-disable @typescript-eslint/naming-convention */
export interface FTPResponse {
    new_task: boolean;
    description: string;
    last_update_time: string; // need to tweak the UI so that we get pascalcase in response
    last_update_timestamp: any;
    status: string;
    task_done_time_str: string;
    task_done_timestamp:  any;
    task_id:  string;
    dry_run: boolean;
}
