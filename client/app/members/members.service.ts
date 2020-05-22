// @flow
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type MembersType = {
    username: string;
    profile?: {}
};

@Injectable()
export class MembersService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get('/api/members/count') as Observable<number>;
    }

    query(username): Observable<MembersType[]> {
        return this.http.get(`/api/members/${username ? username : ""}`) as Observable<MembersType[]>;
    }

    create(members: MembersType) {
        return this.http.post('/api/members/', members);
    }

    remove(members) {
        return this.http.delete(`/api/members/${members.id || members._id}`)
            .pipe(map(() => members));
    }
}
