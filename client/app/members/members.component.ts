import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import { errors } from "../app.constants";

import { MembersService } from "./members.service";

@Component({
    selector: "members",
    template: require("./members.pug"),
    styles: [require("./members.scss")],
})
export class MembersComponent implements OnInit {
    username;
    members: Object[];
    newMember = "";

    count = -1;

    alert: any = new Ngxalert();

    static parameters = [
        Location,
        ActivatedRoute,
        Router,
        ToastrService,
        MembersService,
    ];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private membersService: MembersService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.membersService = membersService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get("username");

            this.username
                ? (this.count = 1)
                : this.membersService
                      .count()
                      .subscribe((count) => (this.count = count));

            this.membersService.query(this.username).subscribe((members) => {
                this.members = members;
            });
        });
    }

    addMember() {
        if (this.newMember) {
            let member = this.newMember;
            this.newMember = "";

            return this.membersService.create({ username: member }).subscribe(
                (members) => {
                    this.username
                        ? this.router.navigate(["/bildirilenler"])
                        : this.members.unshift(members);

                    this.count++;
                },
                (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            member = res.error.username;
                        }

                        return this.router.navigate(["/bildirilenler", member]);
                    }

                    if (res.status === 404) {
                        return this.toastr.error(errors.userNotFound);
                    }

                    this.toastr.error(res.error);
                }
            );
        }
    }

    delete(member) {
        this.alert.create({
            id: "remove-member",
            title: "Üye Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-member");

                this.membersService.remove(member).subscribe((member) => {
                    this.count--;
                    this.members.splice(this.members.indexOf(member), 1);
                });
            },
        });
    }
}
