import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { Options, ImageResult } from "ngx-image2dataurl";

import { errors, maxFileSize } from "../../app.constants";
import { ReportService } from "../report.service";

@Component({
    selector: "addreport",
    template: require("./add.report.pug"),
    styles: [require("./add.report.scss")],
})
export class AddReportComponent implements OnInit {
    username;
    notes;

    submitted;
    validated;

    fileToUpload: File = null;

    @ViewChild("fileInput") fileInput: ElementRef;

    imageOptions: Options = {
        resize: {
            maxHeight: 640,
        },
        allowedExtensions: ["JPG", "PNG"],
    };

    static parameters = [Location, ActivatedRoute, Router, ToastrService, ReportService];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private reportService: ReportService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.reportService = reportService;
    }

    ngOnInit() {
        this.resetForm();
    }

    resetSubmit() {
        this.validated = false;
        this.submitted = false;
    }  
    
    resetForm(resetSubmit = true) {
        this.username = null;
        this.notes = null;

        this.resetFile();

        if (resetSubmit) {
            this.resetSubmit();
        }
    }    

    resetFile() {
        this.fileToUpload = null;

        if (this.fileInput) {
            this.fileInput.nativeElement.value = "";
        }
    }    

    imageSelected(imageResult: ImageResult) {
        const dataURLtoBlob = (dataURL) => {
            var arr = dataURL.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new Blob([u8arr], { type: mime });
        };

        this.fileToUpload = new File(
            [dataURLtoBlob(imageResult.resized.dataURL)],
            imageResult.file.name
        );

        if (this.fileToUpload.size > maxFileSize) {
            this.resetFile();
            this.toastr.error(`Dosya boyutu ${maxFileSize / 1024} KB'tan fazla olamaz!`);            
        }
    }

    addTroll() {
        if (!(this.username && this.notes)) {
            this.validated = true;
            return this.toastr.error(errors.missingInformation);
        }

        this.submitted = true;

        this.reportService
            .create(this.username, this.notes, this.fileToUpload)
            .pipe(
                finalize(() => {
                    this.submitted = false;
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

                        return this.toastr.error(
                            `Bu kullanıcı ${
                                res.status === 302
                                    ? "daha önce bildirilmiş"
                                    : "troll listesinde"
                            }!`
                        );
                    }

                    this.toastr.error(res.error);
                }
            );
    }
}
