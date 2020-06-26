import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { find } from "lodash";

import { errors } from "../app.constants";
import { SpamService } from "./spam.service";

import { safeCb } from "../../components/util";

@Component({
    selector: "spam",
    template: require("./spam.pug"),
    styles: [require("./spam.scss")],
})
export class SpamComponent implements OnInit {
    username;
    spams: Object[];

    newSpam = "";

    selectedListType;

    listTypes: Object[] = [
        {
            text: "Tümü",
            url: "bildirilenler",
            index: 0,
        },
        {
            text: "Kapatılanlar",
            url: "kapatilanlar",
            index: 1,
        },
        {
            text: "Askıya alınanlar",
            url: "askiya-alinanlar",
            index: 2,
        },
    ];

    index = 0;
    count = -1;

    alert: any = new Ngxalert();

    static parameters = [
        Location,
        ActivatedRoute,
        Router,
        ToastrService,
        SpamService,
    ];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private spamService: SpamService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.spamService = spamService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const param = params.get("param");

            this.selectedListType = param
                ? find(this.listTypes, (type) => type["url"] == param)
                : this.listTypes[0];

            if (!(param === "kapatilanlar" || param === "askiya-alinanlar")) {
                this.username = param;
                this.selectedListType = this.listTypes[0];
            }              

            this.getSpams((spams) => {
                this.username
                    ? (this.count = spams.length)
                    : this.spamService
                          .count(this.selectedListType.index)
                          .subscribe((count) => (this.count = count));
            });
        });
    }

    getSpams(cb?) {
        this.spamService
            .query(this.username, ++this.index, this.selectedListType.index)
            .subscribe((spams) => {
                this.spams =
                    this.spams && this.spams[0]
                        ? [...this.spams, ...spams]
                        : spams;

                safeCb(cb)(spams);
            });
    }

    reset(listType?) {
        this.index = 0;
        this.count = -1;
        this.spams = [];
        this.username = null;        
        this.selectedListType = listType || this.listTypes[0];
    }

    list(listType) {    
        if (!this.username && listType == this.selectedListType) {
            return;
        }
        
        this.reset();

        listType.index == 0
            ? this.router.navigate([`/${listType.url}`])
            : this.router.navigate(["/bildirilenler", listType.url]);
    }

    onScroll() {
        this.getSpams();
    }

    addSpam() {
        if (this.newSpam) {
            let spam = this.newSpam;
            this.newSpam = "";

            return this.spamService.create({ username: spam }).subscribe(
                (spams) => {
                    if (this.username) {
                        return this.router.navigate(["/bildirilenler"]);
                    }

                    if (Array.isArray(spams)) {
                        this.spams = [...spams, ...this.spams];
                        this.count += spams.length;
                    } else {
                        this.spams.unshift(spams);
                        this.count++;
                    }
                },
                (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            spam = res.error.username;
                        }

                        this.reset();

                        return this.router.navigate(["/bildirilenler", spam]);
                    }

                    if (res.status === 404) {
                        return this.toastr.error(errors.userNotFound);
                    }

                    this.toastr.error(res.error);
                }
            );
        }
    }

    queue(spam) {
        this.alert.create({
            id: "spam-user",
            title: "Kullanıcı Bildirilecektir",
            message: "Tekrar bildirmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("spam-user");

                this.spamService
                    .queue(spam)
                    .subscribe(() =>
                        this.toastr.error("Kullanıcı tekrar kuyruğa alındı.")
                    );
            },
        });
    }

    delete(spam) {
        this.alert.create({
            id: "remove-user",
            title: "Kullanıcı Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-user");

                this.spamService.remove(spam).subscribe((spamedUser) => {
                    this.count--;
                    this.spams.splice(this.spams.indexOf(spamedUser), 1);
                });
            },
        });
    }
}
