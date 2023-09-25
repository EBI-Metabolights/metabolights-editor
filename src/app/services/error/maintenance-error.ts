import * as toastr from "toastr";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IAppState } from "../../store";
import { NgRedux } from "@angular-redux/store";

export class MaintenanceError {
  constructor(error: any = null) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "MetaboLights is under maintenance. Please try later.";
    const errorStatus = error.statusText ? error.statusText : "";
    toastr.error(
      errorMessage,
      "",
      {
        timeOut: "5000",
        positionClass: "toast-bottom-right",
        preventDuplicates: true,
        extendedTimeOut: 0,
      }
    );
    return error;
  }
}
