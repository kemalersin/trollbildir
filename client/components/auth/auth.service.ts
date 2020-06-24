import { Injectable, EventEmitter, Output } from "@angular/core";
import { UserService } from "./user.service";
import { HttpClient } from "@angular/common/http";
import { safeCb } from "../util";
import { userRoles } from "../../app/app.constants";
import { CookieService } from "ngx-cookie-service";

// @flow
class User {
    _id = "";
    name = "";
    username = "";
    email = "";
    role = "";
    provider = "";
}

@Injectable()
export class AuthService {
    _currentUser: User = new User();
    @Output() currentUserChanged = new EventEmitter(true);
    userRoles = userRoles || [];
    UserService;

    static parameters = [HttpClient, UserService, CookieService];
    constructor(
        private http: HttpClient,
        private userService: UserService,
        private cookieService: CookieService
    ) {
        this.http = http;
        this.UserService = userService;

        let token = cookieService.get("token");

        if (token) {
            localStorage.setItem("id_token", token);
            cookieService.delete("token");
        }

        if (localStorage.getItem("id_token")) {
            this.UserService.get()
                .toPromise()
                .then((user: User) => {
                    this.currentUser = user;
                })
                .catch((err) => {
                    console.log(err);

                    localStorage.removeItem("id_token");
                });
        }
    }

    static hasRole(userRole, role) {
        return userRoles.indexOf(userRole) >= userRoles.indexOf(role);
    }

    get currentUser() {
        return this._currentUser;
    }

    set currentUser(user) {
        this._currentUser = user;
        this.currentUserChanged.emit(user);
    }

    login(username, password, captcha) {
        return this.http
            .post("/auth/local", {
                username,
                password,
                captcha,
            })
            .toPromise()
            .then((res: { token: string }) => {
                localStorage.setItem("id_token", res.token);
                return this.UserService.get().toPromise();
            })
            .then((user: User) => {
                this.currentUser = user;
                localStorage.setItem("user", JSON.stringify(user));
                return user;
            })
            .catch((err) => {
                this.logout();
                return Promise.reject(err);
            });
    }

    logout(force = false) {
        if (force) {
            this.userService.logout().subscribe();
        }

        localStorage.removeItem("user");
        localStorage.removeItem("id_token");
        this.currentUser = new User();
        return Promise.resolve();
    }

    createUser(user, captcha, callback) {
        return this.UserService.create(user, captcha)
            .toPromise()
            .then((data) => {
                localStorage.setItem("id_token", data.token);
                return this.UserService.get().toPromise();
            })
            .then((_user: User) => {
                this.currentUser = _user;
                return safeCb(callback)(null, _user);
            })
            .catch((err) => {
                safeCb(callback)(err);
                return Promise.reject(err);
            });
    }

    changeUsername(username, name, callback) {
        return this.UserService.changeUsername(
            { id: this.currentUser._id },
            username,
            name
        )
            .toPromise()
            .then(() => {
                this.currentUser.name = name;
                this.currentUser.username = username;

                safeCb(callback)(null);
            })
            .catch((err) => safeCb(callback)(err));
    }

    changePassword(oldPassword, newPassword, callback) {
        return this.UserService.changePassword(
            { id: this.currentUser._id },
            oldPassword,
            newPassword
        )
            .toPromise()
            .then(() => safeCb(callback)(null))
            .catch((err) => safeCb(callback)(err));
    }

    getCurrentUser(callback?) {
        safeCb(callback)(this.currentUser);
        return Promise.resolve(this.currentUser);
    }

    getCurrentUserSync() {
        return this.currentUser;
    }

    isLoggedIn(callback?, isTwitterUser?) {
        let is = !!this.currentUser._id;

        if (is || !localStorage.getItem("id_token")) {
            if (isTwitterUser && this.currentUser) {
                is = this.currentUser.provider == "twitter";
            }

            safeCb(callback)(is);
            return Promise.resolve(is);
        } else {
            return this.UserService.get()
                .toPromise()
                .then((user: User) => {
                    const result =
                        !!this.currentUser._id && (!isTwitterUser || user.provider == "twitter");

                    safeCb(callback)(result);
                    return result;
                })
                .catch((err) => {
                    localStorage.removeItem("id_token");
                    safeCb(callback)(false);

                    return false;
                });
        }
    }

    isLoggedInSync() {
        return !!this.currentUser._id;
    }

    isTwitterUser(callback?, allRoles?) {
        return this.getCurrentUser().then((user) => {
            var is =
                user.role &&
                (allRoles || user.role === "user") &&
                user.provider === "twitter";
            safeCb(callback)(is);
            return is;
        });
    }

    isTwitterUserSync() {
        return this.currentUser.role === "user";
    }

    isMember(callback?) {
        return this.getCurrentUser().then((user) => {
            var is = user.role && user.role !== "user";
            safeCb(callback)(is);
            return is;
        });
    }

    isMemberSync() {
        return this.currentUser.role !== "user";
    }

    isAdmin(callback?) {
        return this.getCurrentUser().then((user) => {
            var is = user.role === "admin";
            safeCb(callback)(is);
            return is;
        });
    }

    isAdminSync() {
        return this.currentUser.role === "admin";
    }

    getToken() {
        return localStorage.getItem("id_token");
    }
}
