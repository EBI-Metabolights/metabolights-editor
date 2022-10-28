export interface FTPResponse {
    description: string;
    last_update_time: string; // need to tweak the UI so that we get pascalcase in response
    status: string;
}