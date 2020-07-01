import { Component, OnInit } from "@angular/core";

import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { ReportService } from "./report.service";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "report",
    template: require("./report.pug"),
    styles: [require("./report.scss")],
})
export class ReportComponent implements OnInit {
    username;
    reports: Object[];
    newReport = "";

    index = 1;
    count = -1;

    filter;
    currentUser = {};

    alert: any = new Ngxalert();

    AuthService;

    static parameters = [
        ActivatedRoute,
        Router,
        ToastrService,
        ReportService,
        AuthService,
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private reportService: ReportService,
        private authService: AuthService
    ) {
        this.route = route;
        this.router = router;
        this.reportService = reportService;

        this.AuthService = authService;
    }

    ngOnInit() {
        this.reset();

        this.AuthService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });

        this.route.paramMap.subscribe((params) => {
            this.filter = params.get("filter");

            if (
                !(
                    this.filter == "onaylananlar" ||
                    this.filter == "onaylanmayanlar" ||
                    this.filter == "onay-bekleyenler"
                )
            ) {
                this.username = this.filter;
                this.filter = null;
            }

            this.reportService
                .query(this.filter || this.username)
                .subscribe((reports) => {
                    this.reports = reports;

                    this.username
                        ? (this.count = reports.length)
                        : this.reportService
                              .count(this.filter)
                              .subscribe((count) => (this.count = count));
                });
        });
    }

    reset() {
        this.AuthService.getCurrentUser().then((user) => {
            this.currentUser = user;
        });
    }

    get(route) {
        if (route === this.filter) {
            return;
        }

        this.count = -1;
        this.reports = [];
        this.router.navigate([`/bildirimlerim/${route ? route : ""}`]);
    }

    onScroll() {
        this.reportService
            .query(this.filter || this.username, ++this.index)
            .subscribe((reports) => {
                this.reports = [...this.reports, ...reports];
            });
    }

    check(index) {
        this.count--;
        this.reports.splice(index, 1);

        if (this.count && !this.reports.length) {
            this.index = 0;
            this.onScroll();
        }
    }

    approve(report) {
        this.reportService.approve(report).subscribe((reportedUser) => {
            var n = this.reports.indexOf(reportedUser);

            if (!this.filter) {
                this.reports[n]["isApproved"] = true;
                this.toastr.info("Onaylandı.");

                return;
            }

            this.check(n);
        });
    }

    ban(report) {
        this.alert.create({
            id: "ban-user",
            title: "Kullanıcı Engellenecektir",
            message: "Engellemek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("ban-user");

                this.reportService
                    .ban(report)
                    .subscribe((reportedUser) =>
                        this.toastr.info(
                            "Kullanıcı engelleme listesine alındı."
                        )
                    );
            },
        });
    }

    reject(report) {
        this.reportService.reject(report).subscribe((reportedUser) => {
            var n = this.reports.indexOf(reportedUser);

            if (!this.filter) {
                this.reports[n]["isApproved"] = false;

                this.toastr.info("Onaylanmadı.");
                return;
            }

            this.check(n);
        });
    }

    delete(report) {
        this.alert.create({
            id: "remove-user",
            title: "Kullanıcı Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-user");
                this.reportService
                    .remove(report)
                    .subscribe((reportedUser) =>
                        this.check(this.reports.indexOf(reportedUser))
                    );
            },
        });
    }
}
