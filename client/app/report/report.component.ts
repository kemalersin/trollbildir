import { Component, OnInit } from "@angular/core";

import { Router, ActivatedRoute } from "@angular/router";

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

    AuthService;

    static parameters = [ActivatedRoute, Router, ReportService, AuthService];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
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

    approve(report) {
        this.reportService.approve(report).subscribe((reportedUser) => {
            var n = this.reports.indexOf(reportedUser);

            if (!this.filter) {
                this.reports[n]["isApproved"] = true;

                alert("Onaylandı!");
                return;
            }

            this.count--;
            this.reports.splice(n, 1);
        });
    }

    ban(report) {
        if (!confirm("Emin misiniz?")) {
            return;
        }

        this.reportService
            .ban(report)
            .subscribe((reportedUser) =>
                alert("Kullanıcı, engelleme listesine alındı.")
            );
    }

    reject(report) {
        this.reportService.reject(report).subscribe((reportedUser) => {
            var n = this.reports.indexOf(reportedUser);

            if (!this.filter) {
                this.reports[n]["isApproved"] = false;

                alert("Onaylanmadı!");
                return;
            }

            this.count--;
            this.reports.splice(n, 1);
        });
    }

    delete(report) {
        if (!confirm("Emin misiniz?")) {
            return;
        }

        this.reportService.remove(report).subscribe((reportedUser) => {
            this.count--;
            this.reports.splice(this.reports.indexOf(reportedUser), 1);
        });
    }
}
