import {
    Component,
    OnInit
} from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { ReportService } from "./report.service";

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

    static parameters = [ActivatedRoute, Router, ReportService];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService
    ) {
        this.route = route;
        this.router = router;
        this.reportService = reportService;
    }

    ngOnInit() {
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

            this.reportService.query(this.filter || this.username).subscribe((reports) => {
                this.reports = reports;

                this.username
                    ? (this.count = reports.length)
                    : this.reportService
                          .count(this.filter)
                          .subscribe((count) => (this.count = count));
            });
        });
    }

    get(route) {
        this.router.navigate([`/bildirimlerim/${route ? route : ""}`]);
    }

    onScroll() {
        this.reportService
            .query(this.filter || this.username, ++this.index)
            .subscribe((reports) => {
                this.reports = [...this.reports, ...reports];
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
