import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";

import { errors, EMAIL_REGEXP } from "../../app.constants";
import { UserService } from "../../../components/auth/user.service";

@Component({
    selector: "password-reset",
    template: require("./password.reset.pug"),
})
export class PasswordResetComponent implements OnInit {
    email;
    password;
    captcha;

    submitted;
    validated;

    resetCode;

    isReset;

    emailRegExp = EMAIL_REGEXP;

    static parameters = [
        HttpClient,
        ToastrService,
        UserService,
        Router,
        ActivatedRoute,
    ];

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.route = route;
        this.router = router;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.resetCode = params.get("reset-code");
            this.isReset = !!this.resetCode;
        });

        this.resetForm();
    }

    resetSubmit() {
        this.validated = false;
        this.submitted = false;
    }

    resetForm(resetSubmit = true) {
        this.email = null;

        if (resetSubmit) {
            this.resetSubmit();
        }
    }

    reset() {
        let error = "";

        if (!(this.email && this.captcha) || (this.isReset && !this.password)) {
            error = errors.missingInformation;
        } else if (!EMAIL_REGEXP.test(this.email)) {
            error = errors.incorrectEmail;
        }

        if (error) {
            this.validated = true;
            return this.toastr.error(error);
        }

        this.submitted = true;

        this.isReset
            ? this.userService
                  .resetPassword(
                      this.email,
                      this.password,
                      this.resetCode,
                      this.captcha
                  )
                  .pipe(finalize(() => this.resetSubmit()))
                  .subscribe(
                      () => {
                          this.toastr.info("Parolanız sıfırlandı.");
                          this.router.navigateByUrl("/giris");
                      },
                      (res) => {
                          if (res.status === 401) {
                              return this.toastr.error(
                                  "Parola sıfırlama kodunuz geçersizdir."
                              );
                          }

                          if (res.status === 404) {
                              return this.toastr.error(
                                  "E-posta adresi bulunamadı."
                              );
                          }

                          this.toastr.error(res.error);
                      }
                  )
            : this.userService
                  .sendPasswordResetCode(this.email, this.captcha)
                  .pipe(finalize(() => this.resetSubmit()))
                  .subscribe(
                      () => {
                          this.toastr.info(
                              "Parola sıfırlama bağlantınız gönderildi."
                          );
                          this.router.navigateByUrl("/giris");
                      },
                      (res) => {
                          if (res.status === 404) {
                              return this.toastr.error(
                                  "E-posta adresi bulunamadı."
                              );
                          }

                          this.toastr.error(res.error);
                      }
                  );
    }
}
