import * as toastr from "toastr";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IAppState } from "./../../store";
import { NgRedux } from "@angular-redux/store";

export class InternalServerError {
  constructor(error: any = null) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "Internal server error."
    toastr.warning(
      errorMessage +
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
