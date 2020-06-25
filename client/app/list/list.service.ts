// @flow
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type ListType = {
    username: string;
    profile?: {};
};

@Injectable()
export class ListService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(listType): Observable<number> {
        return this.http.get(`/api/lists/count/${listType}`) as Observable<number>;
    }

    query(listType, username = "", index = 1): Observable<ListType[]> {
        return this.http.get(
            `/api/lists/${listType}/${username ? username : ""}?index=${index}`
        ) as Observable<ListType[]>;
    }

    remove(item) {
        return this.http
            .delete(`/api/lists/${item.id || item._id}`)
            .pipe(map(() => item));
    }    
}
