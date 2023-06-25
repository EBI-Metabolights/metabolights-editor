/* eslint-disable @typescript-eslint/naming-convention */
export interface AsyncTaskResponse {
  new_task: boolean;
  message: string;
  task: {
    task_id: string;
    last_status: string;
    last_update_time: number;
    last_update_time_str: string;
    task_done_time:  number;
    task_done_time_str: string;
  };
};
