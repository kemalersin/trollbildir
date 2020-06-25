import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { finalize } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { ListService } from "./list.service";

@Component({
    selector: "list",
    template: require("./list.pug"),
    styles: [require("./list.scss")],
})
export class ListComponent implements OnInit {
    username;
    list: Object[];

    index = 1;
    count = -1;

    loading;

    selectedTab = "bildirilenler";

    menu = [
        {
            heading: "Bildirilenler",
            tabName: "bildirilenler",
        },
        {
            heading: "Gizlenenler",
            tabName: "gizlenenler",
        },
    ];

    alert: any = new Ngxalert();

    static parameters = [Location, ActivatedRoute, ToastrService, ListService];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private listService: ListService
    ) {
        this.route = route;
        this.location = location;
        this.listService = listService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.selectTab(params.get("tabName") || this.selectedTab);
        });
    }

    getSpams() {
        this.loading = true;

        this.listService
            .query(this.selectedTab, this.username)
            .subscribe((list) => {
                this.list = list;

                if (this.username) {
                    this.loading = false;
                    this.count = list.length;
                } else {
                    this.count = -1;

                    this.listService
                        .count(this.selectedTab)
                        .pipe(finalize(() => (this.loading = false)))
                        .subscribe((count) => (this.count = count));
                }
            });
    }

    selectTab(tabName) {
        this.username = null;
        this.selectedTab = tabName;

        this.getSpams();
        this.location.replaceState(`/listem/${tabName}`);
    }

    onScroll() {
        this.listService
            .query(this.selectedTab, this.username, ++this.index)
            .subscribe((list) => {
                this.list = [...this.list, ...list];
            });
    }

    delete(spam) {
        const title =
            this.selectedTab === "bildirilenler" ? "Bildirim" : "Gizleme";

        this.alert.create({
            id: "remove-item",
            title: `${title} Kaldırılacaktır`,
            message: "Kaldırmak istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-item");

                this.listService.remove(spam).subscribe((profile) => {
                    this.count--;
                    this.list.splice(this.list.indexOf(profile), 1);
                });
            },
        });
    }
}
