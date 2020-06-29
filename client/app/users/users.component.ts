import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { Ngxalert } from "ngx-dialogs";

import { find } from "lodash";
import { safeCb } from "../../components/util";

import { UserService } from "../../components/auth/user.service";

@Component({
    selector: "users",
    template: require("./users.pug"),
    styles: [require("./users.scss")],
})
export class UsersComponent implements OnInit {
    users: Object[];

    username = "";

    selectedListType;

    listTypes: Object[] = [
        {
            text: "Tümü",
            url: "uyeler",
            index: 0,
        },
        {
            text: "Kısıtlananlar",
            url: "kisitlananlar",
            index: 1,
        },
        {
            text: "Engellenenler",
            url: "engellenenler",
            index: 2,
        },
        {
            text: "Askıya alınanlar",
            url: "askiya-alinanlar",
            index: 3,
        },
        {
            text: "Geçersiz access token",
            url: "gecersiz-access-token",
            index: 4,
        },
    ];

    index = 0;
    count = -1;

    alert: any = new Ngxalert();

    static parameters = [Location, ActivatedRoute, Router, UserService];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.userService = userService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const param = params.get("param");
            
            const paramIsNotUsername =
                param === "kisitlananlar" ||
                param === "engellenenler" ||
                param === "askiya-alinanlar" ||
                param === "gecersiz-access-token";

            this.selectedListType = param
                ? find(this.listTypes, (type) => type["url"] == param)
                : this.listTypes[0];

            if (!paramIsNotUsername) {
                this.username = param;
                this.selectedListType = this.listTypes[0];
            }

            this.reset(this.selectedListType, paramIsNotUsername);

            this.getUsers((data) => {
                this.username
                    ? (this.count = data.length)
                    : this.userService
                          .count(this.selectedListType.index)
                          .subscribe((count) => (this.count = count));
            });
        });
    }

    getUsers(cb?) {
        this.userService
            .query(this.username, ++this.index, this.selectedListType.index)
            .subscribe((users) => {
                this.users =
                    this.users && this.users[0]
                        ? [...this.users, ...users]
                        : users;

                safeCb(cb)(users);
            }, (err) => {
                this.count = 0;
            });
    }

    reset(listType?, resetUser = true) {
        this.index = 0;
        this.count = -1;
        this.users = [];
        this.selectedListType = listType || this.listTypes[0];

        if (resetUser) {
            this.username = null;
        }
    }

    list(listType) {
        if (!this.username && listType == this.selectedListType) {
            return;
        }

        listType.index == 0
            ? this.router.navigate([`/${listType.url}`])
            : this.router.navigate(["/uyeler", listType.url]);
    }

    find() {
        return this.router.navigate(["/uyeler", this.username]);
    }

    onScroll() {
        this.getUsers();
    }

    ban(user) {
        this.alert.create({
            id: "ban-user",
            title: "Kullanıcı Engellenecektir",
            message: "Engellemek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("ban-user");

                this.userService.ban(user).subscribe((bannedUser) => {
                    bannedUser.isBanned = true;
                    this.users[this.users.indexOf(user)] = bannedUser;
                });
            },
        });
    }    

    delete(user) {
        this.alert.create({
            id: "remove-user",
            title: "Kullanıcı Silinecektir",
            message: "Silmek istediğinizden emin misiniz?",
            customCssClass: "custom-alert",
            confirm: () => {
                this.alert.removeAlert("remove-user");

                this.userService.remove(user).subscribe((deletedUser) => {
                    this.count--;
                    this.users.splice(this.users.indexOf(deletedUser), 1);
                });
            },
        });
    }    
}
