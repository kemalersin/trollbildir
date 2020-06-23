import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";

import { errors, messages } from "../app.constants";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "random",
    template: require("./random.pug"),
})
export class RandomComponent implements OnInit {
    static parameters = [
        HttpClient,
        ToastrService,
        AuthService,
        Router,
        ActivatedRoute,
    ];

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.route = route;
        this.router = router;
    }

    ngOnInit() {
    } 
}
