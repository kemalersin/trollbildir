// @flow
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type SpamType = {
    username: string;
    profile?: {};
};

@Injectable()
export class SpamService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(): Observable<number> {
        return this.http.get("/api/spams/count") as Observable<number>;
    }

    random(): Observable<SpamType[]> {
        return this.http.get("/api/spams/random") as Observable<SpamType[]>;
    }    

    query(username = "", index = 1): Observable<SpamType[]> {
        return this.http.get(
            `/api/spams/${username ? username : ""}?index=${index}`
        ) as Observable<SpamType[]>;
    }

    create(spam: SpamType) {
        return this.http.post("/api/spams/", spam);
    }

    hide(profile, spamed?) {
        return this.http
            .post(`/api/spams/hide/${profile.id_str}`, {spamed})
            .pipe(map(() => profile));
    }    

    remove(spam) {
        return this.http
            .delete(`/api/spams/${spam.id || spam._id}`)
            .pipe(map(() => spam));
    }

    queue(spam) {
        return this.http.post("/api/spams/queue", spam);
    }

    upload(file) {
        const formData: FormData = new FormData();

        formData.append("list", file, file.name);

        const headers = new HttpHeaders();

        headers.append("Content-Type", "multipart/form-data");
        headers.append("Accept", "application/json");

        return this.http.post("/api/spams/upload", formData, { headers });
    }
}
