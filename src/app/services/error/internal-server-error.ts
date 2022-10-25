import * as toastr from "toastr";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IAppState } from "./../../store";
import { NgRedux } from "@angular-redux/store";

export class InternalServerError {
  constructor(error: any = null) {
    toastr.warning(
      error.message +
        ' <a href="mailto:metabolights-help@ebi.ac.uk">Contact us</a> if the problem persist.',
      "",
      {
        timeOut: "0",
        positionClass: "toast-bottom-right",
        preventDuplicates: true,
        extendedTimeOut: 0,
      }
    );
    return error;
  }
}
