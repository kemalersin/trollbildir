import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

import { ToastrService } from "ngx-toastr";

@Component({
    selector: "captcha",
    template: require("./captcha.pug"),
    styles: [require("./captcha.scss")],
})
export class CaptchaComponent implements OnInit {
    captchaUrl;

    static parameters = [HttpClient, DomSanitizer, ToastrService];

    @Input() text: string;
    @Output() onChange = new EventEmitter();

    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.refreshCaptcha();
    }

    change() {
        this.onChange.emit({ value: this.text });
    }

    refreshCaptcha() {
        const version = new Date().getTime();

        if (!this.captchaUrl) {
            this.captchaUrl = `/api/captcha?${version}`;

            return;
        }

        this.http
            .get(`/api/captcha?${version}`, {
                responseType: "blob",
            })
            .subscribe(
                (blob: any) => {
                    let objectURL = URL.createObjectURL(blob);
                    this.captchaUrl = this.sanitizer.bypassSecurityTrustUrl(
                        objectURL
                    );
                },
                (res) => {
                    if (res.status === 429) {
                        this.toastr.error(
                            "Yeni doğrulama kodu üretmek için biraz bekleyin."
                        );
                    }
                }
            );
    }
}
