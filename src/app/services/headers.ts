import { HttpHeaders } from '@angular/common/http';

export let httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Accept: 'application/json',
    user_token: 'dummy'
  })
};
