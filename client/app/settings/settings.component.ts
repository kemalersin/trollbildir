import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { finalize } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

import { find, filter, sortBy } from "lodash";

import { Ngxalert } from "ngx-dialogs";
import { ToastrService } from "ngx-toastr";

import {
    errors,
    nameMinimumLength,
    usernameMinimumLength,
    passwordMinimumLength,
} from "../app.constants";

import { AuthService } from "../../components/auth/auth.service";
import { UserService } from "../../components/auth/user.service";

@Component({
    selector: "settings",
    template: require("./settings.pug"),
    styles: [require("./settings.scss")],
})
export class SettingsComponent implements OnInit {
    members: Object[];

    bannedTags: Object[] = [];
    bannedIps: Object[] = [];
    bannedUsers: Object[] = [];

    submitted;
    validated;

    bannedTag;
    foundTag;
    deletedTag;

    bannedIp;
    foundIp;
    deletedIp;

    bannedUser;
    foundUser;
    deletedUser;

    name;
    username;

    oldPassword;
    newPassword;

    memberemail;
    password;

    isAdmin;
    isMember;
    isLoggedIn;
    currentUser = {};

    alert: any = new Ngxalert();

    selectedTab = "kullanici-adi";

    menu = [
        {
            heading: "Kullanıcı Adı",
            tabName: "kullanici-adi",
        },
        {
            heading: "Parola",
            tabName: "parola",
        }
    ];

    static parameters = [
        Location,
        ActivatedRoute,
        ToastrService,
        AuthService,
        UserService,
    ];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private authService: AuthService,
        private userService: UserService
    ) {
        this.route = route;
        this.location = location;

        this.authService = authService;
        this.userService = userService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.selectTab(params.get("tabName") || this.selectedTab);
        });

        this.reset();

        this.authService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });
    }

    reset() {
        this.authService.isLoggedIn().then((is) => {
            this.isLoggedIn = is;
        });

        this.authService.isMember().then((is) => {
            this.isMember = is;
        });

        this.authService.isAdmin().then((is) => {
            this.isAdmin = is;
        });

        this.authService.getCurrentUser().then((user) => {
            this.currentUser = user;

            this.name = user.name;
            this.username = user.username;
        });
    }

    resetSubmit() {
        this.validated = false;
        this.submitted = false;
    }

    selectTab(tabName) {
        this.selectedTab = tabName;

        this.oldPassword = null;
        this.newPassword = null;

        this.resetSubmit();
        this.location.replaceState(`/ayarlar/${tabName}`);
    }  

    changeUsername() {
        let error = "";

        if (!this.username) {
            error = errors.missingUsername;
        } else if (this.username.length < usernameMinimumLength) {
            error = errors.usernameMinimumLength;
        } else if (this.name && this.name.length < nameMinimumLength) {
            error = errors.nameMinimumLength;
        }

        if (error) {
            this.validated = true;
            return this.toastr.error(error);
        }

        this.submitted = true;

        this.authService.changeUsername(this.username, this.name, (err) => {
            this.resetSubmit();

            if (!err) {
                return this.toastr.info("Kullanıcı adınız değiştirildi.");
            }

            this.toastr.error(
                err.status === 403
                    ? "Kullanıcı adı daha önce alınmış."
                    : "Kullanıcı adınız değiştirilemedi."
            );
        });
    }

    changePassword() {
        let error = "";

        if (!(this.oldPassword && this.newPassword)) {
            error = errors.missingInformation;
        } else if (
            this.oldPassword.length < passwordMinimumLength ||
            this.newPassword.length < passwordMinimumLength
        ) {
            error = errors.passwordMinimumLength;
        }

        if (error) {
            this.validated = true;
            return this.toastr.error(error);
        }

        this.submitted = true;

        this.authService.changePassword(
            this.oldPassword,
            this.newPassword,
            (err) => {
                this.resetSubmit();

                if (!err) {
                    return this.toastr.info("Parolanız değiştirildi.");
                }

                this.toastr.error(
                    err.status === 403
                        ? "Eski parolanızı yanlış girdiniz."
                        : "Parolanız değiştirilemedi."
                );
            }
        );
    }
}
