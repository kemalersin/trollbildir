import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { maxFileSize } from "../../app.constants";
import { ReportService } from "../report.service";

@Component({
    selector: "addreport",
    template: require("./add.report.pug"),
    styles: [require("./add.report.scss")],
})
export class AddReportComponent implements OnInit {
    username;
    notes;

    submitting;
    fileToUpload: File = null;

    @ViewChild("fileInput") fileInput: ElementRef;

    static parameters = [Location, ActivatedRoute, Router, ReportService];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.reportService = reportService;
    }

    ngOnInit() {}

    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);

        if (this.fileToUpload.size > maxFileSize) {
            alert(`Dosya boyutu ${maxFileSize / 1024} KB'tan fazla olamaz!`);

            this.fileToUpload = null;
            this.fileInput.nativeElement.value = "";
        }
    }

    addTroll() {
        if (!(this.username && this.notes)) {
            return alert("Kullanıcı adı ya da bildirme nedeni boş olamaz!");
        }

        this.submitting = true;

        this.reportService
            .create(this.username, this.notes, this.fileToUpload)
            .pipe(
                finalize(() => {
                    this.submitting = false;
                })
            )
            .subscribe(
                () => this.router.navigate(["/bildirimlerim"]),
                (res) => {
                    if (res.status === 302 || res.status === 304) {
                        if (res.error && res.error.username) {
                            let block = res.error.username;
                            return this.router.navigate([
                                "/bildirimlerim",
                                block,
                            ]);
                        }

                        return alert(
                            `Bu kullanıcı ${
                                res.status === 302
                                    ? "daha önce bildirilmiş"
                                    : "troll listesinde"
                            }!`
                        );
                    }

                    alert(res.error);
                }
            );
    }
}
