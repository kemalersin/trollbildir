// @flow
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type ReportType = {
    username: string;
    profile?: {};
};

@Injectable()
export class ReportService {
    static parameters = [HttpClient];
    constructor(private http: HttpClient) {
        this.http = http;
    }

    count(filter): Observable<number> {
        return this.http.get(
            `/api/reports/count${filter ? "?filter=" + filter : ""}`
        ) as Observable<number>;
    }

    query(filter = "", index = 1): Observable<ReportType[]> {
        return this.http.get(
            `/api/reports/${filter ? filter : ""}?index=${index}`
        ) as Observable<ReportType[]>;
    }

    create(username, notes, file: File) {
        const formData: FormData = new FormData();

        formData.append("username", username);
        formData.append("notes", notes);

        if (file) {
            formData.append("file", file, file.name);
        }

        return this.http.post("/api/reports/", formData);
    }

    remove(report) {
        return this.http
            .delete(`/api/reports/${report.id || report._id}`)
            .pipe(map(() => report));
    }
}
