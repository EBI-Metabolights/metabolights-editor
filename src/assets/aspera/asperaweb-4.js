/*
 * Revision: 3.9.9.177872
 * Revision date: 03/03/2020
 *
 * http://www.asperasoft.com/
 *
 * © Copyright IBM Corp. 2008, 2020
 */
"use strict";
if (typeof AW4 == "undefined") var AW4 = {};
(AW4.__VERSION__ = "3.9.9.177872"),
  (AW4.Logger = (function () {
    function i(b) {
      (AW4.LogLevel = b), h(a, b);
    }
    function h(a, b) {
      try {
        if (typeof localStorage == "undefined") return "";
        return localStorage.setItem(a, b);
      } catch (c) {
        console.log("Error accessing localStorage: " + JSON.stringify(c));
        return;
      }
    }
    function c(a) {
      typeof window.console != "undefined" && console.error(a);
    }
    function g(a) {
      typeof window.console != "undefined" && console.warn(a);
    }
    function f(a) {
      typeof window.console != "undefined" && console.log(a);
    }
    function e(a) {
      AW4.LogLevel >= b.DEBUG &&
        typeof window.console != "undefined" &&
        console.log(a);
    }
    function d(a) {
      AW4.LogLevel >= b.TRACE &&
        typeof window.console != "undefined" &&
        console.log(a);
    }
    var a = "aspera-log-level",
      b = {
        INFO: 0,
        DEBUG: 1,
        TRACE: 2,
      };
    AW4.LogLevel = b.INFO;
    try {
      if (typeof localStorage == "undefined") return;
      AW4.LogLevel = localStorage.getItem(a);
    } catch (c) {}
    return {
      LEVEL: b,
      log: f,
      debug: e,
      trace: d,
      warn: g,
      error: c,
      setLevel: i,
    };
  })()),
  typeof AW4.Utils == "undefined" &&
    (AW4.Utils = (function () {
      function T(a, b) {
        try {
          if (typeof localStorage == "undefined") return "";
          return localStorage.setItem(a, b);
        } catch (c) {
          console.log("Error accessing localStorage: " + JSON.stringify(c));
          return;
        }
      }
      function S(a) {
        try {
          if (typeof localStorage == "undefined") return "";
          return localStorage.getItem(a);
        } catch (b) {
          console.log("Error accessing localStorage: " + JSON.stringify(b));
          return "";
        }
      }
      function R(a, b) {
        if (z(a)) return Array(a);
        return a.split(b);
      }
      function Q() {
        typeof AW4.objectId == "undefined" && (AW4.objectId = 0),
          AW4.objectId++;
        return AW4.objectId;
      }
      function P(a) {
        return window.atob ? decodeURIComponent(escape(window.atob(a))) : a;
      }
      function O(a) {
        return window.btoa ? window.btoa(unescape(encodeURIComponent(a))) : a;
      }
      function N(a) {
        if (typeof a != "string") return null;
        var b = a,
          c = document.createElement("a");
        c.href = b;
        var d = c.href;
        d.indexOf("/", d.length - 1) !== -1 && (d = d.slice(0, -1));
        return d;
      }
      function H(a) {
        var b = "",
          c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var d = 0; d < a; d++)
          b += c.charAt(Math.floor(Math.random() * c.length));
        return b;
      }
      function G() {
        var a = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (b) {
            var c = ((a + 16) * Math.random()).toFixed() % 16;
            b !== "x" && (c = (c & 3) | 8);
            return c.toString(16);
          }
        );
      }
      function C(a) {
        var b = !1;
        typeof sessionStorage != "undefined" &&
          typeof a == "boolean" &&
          (sessionStorage.setItem(
            this.SS_APPSIDE_WAMPSESSN_LAUNCH_ATTEMPTED,
            a ? "yes" : "no"
          ),
          (b = !0));
        return b;
      }
      function B() {
        var a = !1;
        if (typeof sessionStorage != "undefined") {
          var b = sessionStorage.getItem(
            this.SS_APPSIDE_WAMPSESSN_LAUNCH_ATTEMPTED
          );
          !this.isNullOrUndefinedOrEmpty(b) && b === "yes" && (a = !0);
        }
        return a;
      }
      function A() {
        var a = this.SESSION_ID;
        if (typeof sessionStorage != "undefined") {
          var b = sessionStorage.getItem(this.SS_SESSION_LASTKNOWN_ID);
          this.isNullOrUndefinedOrEmpty(b) || (a = b);
        }
        return a;
      }
      function z(a) {
        return a === "" || a === null || typeof a == "undefined";
      }
      function w() {
        return this.CURRENT_API + this.FASP_URL;
      }
      var a = "aspera-drive",
        b = "fasp",
        c = b,
        d = G(),
        e = H(32),
        f = "://initialize",
        g = null,
        h = "connect-version-continued",
        i = "connect-app-id",
        j = "aspera-last-known-session-id",
        k = "aspera-appside-wampsessn-launch-attempted",
        l = null,
        m = null,
        n = 0,
        o = !1,
        p = typeof navigator != "undefined" ? navigator.userAgent : "",
        q = function (a, b) {
          var c = a.match(/(?:Version)[\/](\d+(\.\d+)?)/i),
            d = parseInt((c && c.length > 1 && c[1]) || "0");
          return d >= b;
        },
        r = function (a, b) {
          var c = a.match(/(?:Edge)[\/](\d+(\.\d+)?)/i),
            d = parseInt((c && c.length > 1 && c[1]) || "0");
          return d >= b;
        },
        s = function (a, b) {
          var c = a.match(/(?:Firefox)[\/](\d+(\.\d+)?)/i),
            d = parseInt((c && c.length > 1 && c[1]) || "0");
          return d >= b;
        },
        t = {
          MAC_LEGACY: p.indexOf("Intel Mac OS X 10_6") != -1,
          LINUX: (p.indexOf("X11") != -1) | (p.indexOf("Linux") != -1),
        },
        u = {
          OPERA: /opera|opr/i.test(p) && !/edge/i.test(p),
          IE: /msie|trident/i.test(p) && !/edge/i.test(p),
          CHROME:
            /chrome|crios|crmo/i.test(p) &&
            !/opera|opr/i.test(p) &&
            !/edge/i.test(p),
          FIREFOX: /firefox|iceweasel/i.test(p) && !/edge/i.test(p) && s(p, 50),
          FIREFOX_LEGACY:
            /firefox|iceweasel/i.test(p) && !/edge/i.test(p) && !s(p, 50),
          EDGE_WITH_EXTENSION: /edge/i.test(p) && r(p, 14),
          EDGE_LEGACY: /edge/i.test(p) && !r(p, 14),
          SAFARI:
            /safari/i.test(p) &&
            !/chrome|crios|crmo/i.test(p) &&
            !/edge/i.test(p),
          SAFARI_NO_NPAPI:
            /safari/i.test(p) &&
            !/chrome|crios|crmo/i.test(p) &&
            !/edge/i.test(p) &&
            q(p, 10),
        },
        v = "";
      (function () {
        if (document.all && !window.setTimeout.isPolyfill) {
          var a = window.setTimeout;
          (window.setTimeout = function (b, c) {
            var d = Array.prototype.slice.call(arguments, 2);
            return a(
              b instanceof Function
                ? function () {
                    b.apply(null, d);
                  }
                : b,
              c
            );
          }),
            (window.setTimeout.isPolyfill = !0);
        }
        if (document.all && !window.setInterval.isPolyfill) {
          var b = window.setInterval;
          (window.setInterval = function (a, c) {
            var d = Array.prototype.slice.call(arguments, 2);
            return b(
              a instanceof Function
                ? function () {
                    a.apply(null, d);
                  }
                : a,
              c
            );
          }),
            (window.setInterval.isPolyfill = !0);
        }
      })();
      var x = function (a, b) {
          var c = "";
          a == -1 && (c = "Invalid request");
          return {
            error: {
              code: a,
              internal_message: c,
              user_message: b,
            },
          };
        },
        y = function (a) {
          var b;
          if (
            typeof a == "string" &&
            (a.length === 0 || a.replace(/\s/g, "") === "{}")
          )
            return {};
          try {
            b = JSON.parse(a);
          } catch (c) {
            b = x(-1, c);
          }
          return b;
        },
        D = function (a, b) {
          var c = function (a) {
              var b = R(a, "."),
                c = [];
              for (var d = 0; d < b.length; d++) {
                var e = parseInt(b[d], 10);
                isNaN(e) || c.push(e);
              }
              return c;
            },
            d = c(a),
            e = c(b),
            f;
          for (f = 0; f < Math.min(d.length, e.length); f++) {
            if (d[f] < e[f]) return !0;
            if (d[f] > e[f]) return !1;
          }
          return !1;
        },
        E = function () {
          var a = AW4.Utils.getLocalStorage(AW4.Utils.LS_CONTINUED_KEY);
          if (a !== typeof undefined && a !== null) {
            var b = Math.round(new Date().getTime() / 1e3);
            if (b - a < 1440) {
              AW4.Logger.debug("User opted out of update");
              return !0;
            }
          }
          return !1;
        },
        F = function () {
          AW4.Utils.setLocalStorage(
            AW4.Utils.LS_CONTINUED_KEY,
            Math.round(new Date().getTime() / 1e3)
          );
        },
        I = function (a) {
          var b = AW4.crypt.aesjs.utils.utf8.toBytes(a),
            c = AW4.crypt.aesjs.utils.utf8.toBytes(this.SESSION_KEY),
            d = AW4.crypt.aesjs.utils.utf8.toBytes(H(16)),
            e = new AW4.crypt.aesjs.ModeOfOperation.ofb(c, d),
            f = e.encrypt(b),
            g =
              AW4.crypt.aesjs.utils.hex.fromBytes(d) +
              "." +
              AW4.crypt.aesjs.utils.hex.fromBytes(f);
          return g;
        },
        J = function (a) {
          var b = R(a, ".");
          if (b.length != 2) return a;
          var c = AW4.crypt.aesjs.utils.hex.toBytes(b[0]),
            d = AW4.crypt.aesjs.utils.hex.toBytes(b[1]),
            e = AW4.crypt.aesjs.utils.utf8.toBytes(this.SESSION_KEY),
            f = new AW4.crypt.aesjs.ModeOfOperation.ofb(e, c),
            g = f.decrypt(d),
            h = AW4.crypt.aesjs.utils.utf8.fromBytes(g);
          return g;
        },
        K = function (a) {
          (l = a.wampRouter),
            (m = a.wampRealm),
            (n = a.websocketPort),
            (o = a.isWebsocketSecure);
        },
        L = function (a) {
          return (
            l === a.wampRouter &&
            m === a.wampRealm &&
            n === a.websocketPort &&
            o === a.isWebsocketSecure
          );
        },
        M = function (a) {
          var b = !1,
            c = function (b) {
              typeof a == "function" && a(b);
            },
            d = this.getInitUrl();
          AW4.Logger.log("Starting Connect session: " + d);
          if (u.CHROME || u.OPERA)
            document.body.focus(),
              (document.body.onblur = function () {
                b = !0;
              }),
              (document.location = d),
              setTimeout(function () {
                (document.body.onblur = null), c(b);
              }, 500);
          else if (u.EDGE_LEGACY || u.EDGE_WITH_EXTENSION)
            document.location = d;
          else if (u.FIREFOX_LEGACY || u.FIREFOX || u.SAFARI_NO_NPAPI) {
            var e = document.createElement("IFRAME");
            (e.src = d),
              (e.style.visibility = "hidden"),
              (e.style.position = "absolute"),
              (e.style.width = "0px"),
              (e.style.height = "0px"),
              (e.style.border = "0px"),
              document.body.appendChild(e);
          }
          return null;
        };
      return {
        LS_CONTINUED_KEY: h,
        LS_CONNECT_APP_ID: i,
        SS_SESSION_LASTKNOWN_ID: j,
        SS_APPSIDE_WAMPSESSN_LAUNCH_ATTEMPTED: k,
        SDK_LOCATION: g,
        DRIVE_API: a,
        FASP_API: b,
        FASP_URL: f,
        CURRENT_API: c,
        SESSION_ID: d,
        SESSION_KEY: e,
        OS: t,
        BROWSER: u,
        isNullOrUndefinedOrEmpty: z,
        getSessionId: A,
        getInitUrl: w,
        versionLessThan: D,
        checkVersionException: E,
        addVersionException: F,
        createError: x,
        generateUuid: G,
        generateRandomStr: H,
        encrypt: I,
        decrypt: J,
        setBasicWampSettings: K,
        checkBasicWampSettings: L,
        initUrlWampParams: v,
        getAppWampLaunchAttempted: B,
        setAppWampLaunchAttempted: C,
        launchConnect: M,
        parseJson: y,
        getFullURI: N,
        utoa: O,
        atou: P,
        nextObjectId: Q,
        safeSplit: R,
        getLocalStorage: S,
        setLocalStorage: T,
      };
    })()),
  (AW4.XMLhttpRequestImplementation = function () {
    var a = 33003,
      b = "http://127.0.0.1:",
      c = 20,
      d = 3,
      e = "/v5",
      f = AW4.RequestHandler().STATUS,
      g,
      h,
      i = 0,
      j = a,
      k = {},
      l = [0, 1],
      m = 0,
      n = 0,
      o = "",
      p = 0,
      q = !1,
      r = function () {
        if (y() === null) return !1;
        return !0;
      },
      s = function (a) {
        AW4.Logger.debug(
          "[" +
            m +
            "] Http request handler status changing from[" +
            f.toString(i) +
            "] to[" +
            f.toString(a) +
            "]"
        ),
          (i = a);
        h && a == f.RUNNING ? h() : g && g(a);
      },
      t = function (a, b, c) {
        if (a == 200) {
          var d = AW4.Utils.parseJson(b),
            e = typeof d.error != "undefined";
          !e && AW4.Utils.versionLessThan(d.version, "3.8")
            ? s(f.OUTDATED)
            : s(f.RUNNING);
        }
      },
      u = function () {
        var a = n++;
        z("GET", "/connect/info/version", null, t, a, null);
      },
      v = function (b, d, e) {
        var g = k[e].port;
        delete k[e];
        if (i == f.RUNNING || i == f.STOPPED) return null;
        if (b == 200) {
          (j = g), u();
          return null;
        }
        if (g === a)
          for (var h = a + 1; h < a + c; h++) {
            var l = n++,
              m = "GET",
              o = "/connect/info/ping",
              p = {
                id: l,
                method: m,
                port: h,
                path: o,
                data: null,
                callbacks: null,
              };
            (k[l] = p), (j = h), z(m, o, null, v, l, null);
          }
        return null;
      },
      w = function (b) {
        if (i == f.RUNNING || i == f.STOPPED) return null;
        i == f.INITIALIZING && !b && (AW4.Utils.launchConnect(), s(f.RETRYING));
        var c = l[0] + l[1];
        setTimeout(w, c * 1e3), (l[0] = l[1]), (l[1] = c);
        var d = n++,
          e = "GET",
          g = "/connect/info/ping";
        j = a;
        var h = {
          id: d,
          method: e,
          port: a,
          path: g,
          data: null,
          callbacks: null,
        };
        (k[d] = h), z(e, g, null, v, d, null);
        return null;
      },
      x = function () {
        s(f.RETRYING), AW4.Utils.launchConnect(), w();
      },
      y = function () {
        typeof XMLHttpRequest == "undefined" &&
          (XMLHttpRequest = function () {
            try {
              return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (a) {}
            try {
              return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (a) {}
            try {
              return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (a) {}
            return null;
          });
        return new XMLHttpRequest();
      },
      z = function (a, c, g, h, k) {
        var l = b + j + e + c,
          m = y();
        (m.onreadystatechange = function (a) {
          if (typeof h == "function") {
            if (i == f.STOPPED || q) {
              AW4.Logger.debug(
                "Connect stopped or page unloading. Skipping xhr processing."
              );
              return;
            }
            if (m.readyState != 4) return;
            if (m.status === 0 && i == f.RUNNING) {
              if (
                i == f.RUNNING &&
                p < d &&
                l.indexOf("/connect/transfers/activity") > 0
              ) {
                p++;
                return;
              }
              if (
                i === f.RUNNING &&
                l.indexOf(j) === -1 &&
                l.indexOf("/connect/info/ping") > 0
              )
                return;
              x();
            }
            var b = m.responseText;
            AW4.Logger.trace(
              "HttpRequest processed[" +
                l +
                "] postData[" +
                g +
                "] status[" +
                m.status +
                "] response[" +
                b +
                "]"
            ),
              h(m.status, b, k);
          }
        }),
          m.open(a, l, !0),
          a.toUpperCase() === "GET" ? m.send() : m.send(g);
        return null;
      };
    AW4.Utils.BROWSER.SAFARI_NO_NPAPI &&
      window.addEventListener("beforeunload", function () {
        q = !0;
      });
    var A = function () {
        s(f.STOPPED);
      },
      B = function (a) {
        a.requestStatusCallback && (g = a.requestStatusCallback),
          typeof a.callback == "function" && (h = a.callback),
          a.objectId && ((m = a.objectId), (n = m * 1e4)),
          w(!0);
      };
    return {
      isSupportedByBrowser: r,
      init: B,
      httpRequest: z,
      stop: A,
    };
  }),
  (AW4.NPAPIrequestImplementation = function () {
    function j(b, c, e, f, g) {
      if (a != null) {
        var h = function (a) {
          var b = AW4.Utils.parseJson(a);
          f &&
            (typeof b.error != "undefined"
              ? f(b.error.code, a, g)
              : f(200, a, g));
        };
        e == null && (e = ""),
          (c = d + c),
          a.httpRequestImplementation(b, c, e, h);
        return null;
      }
    }
    function i(d) {
      var i = d.callback || function () {},
        j = d.requestStatusCallback || function () {};
      try {
        if (!!g() && a == null)
          if (
            (AW4.Utils.BROWSER.IE &&
              new ActiveXObject("Aspera.AsperaWebCtrl.1")) ||
            navigator.mimeTypes[f()] !== undefined
          ) {
            (c = d.containerId), (b = d.pluginId), h(d.initializeTimeout);
            var k = setInterval(function () {
              if (!a || !a.queryBuildVersion) return null;
              clearInterval(k);
              if (AW4.Utils.versionLessThan(a.queryBuildVersion(), "3.6"))
                console.log("Plugin too old. Version less than 3.6"),
                  (a = null),
                  j(e.FAILED);
              else {
                i();
                return;
              }
            }, 500);
          } else a == null && (console.log("Plugin not detected"), j(e.FAILED));
      } catch (l) {
        console.log("Plugin load error: " + JSON.stringify(l)), j(e.FAILED);
      }
      return null;
    }
    function h(d) {
      var e = document.getElementById(c);
      if (e == null)
        (e = document.createElement("div")),
          e.setAttribute("id", c),
          e.setAttribute("style", "display:inline-block;height:1px;width:1px;");
      else while (e.firstChild) e.removeChild(e.firstChild);
      (a = document.createElement("object")),
        a.setAttribute("name", b),
        a.setAttribute("id", b),
        a.setAttribute("type", f()),
        a.setAttribute("width", 1),
        a.setAttribute("height", 1);
      var g = document.createElement("param");
      g.setAttribute("name", "connect-launch-wait-timeout-ms"),
        g.setAttribute("value", d),
        a.appendChild(g),
        e.appendChild(a),
        document.body.appendChild(e);
    }
    function g() {
      if (
        AW4.Utils.BROWSER.IE ||
        (AW4.Utils.BROWSER.SAFARI && !AW4.Utils.BROWSER.SAFARI_NO_NPAPI)
      )
        return !0;
      return !1;
    }
    function f() {
      return "application/x-aspera-web";
    }
    var a = null,
      b = null,
      c = null,
      d = "/v5",
      e = AW4.RequestHandler().STATUS;
    return {
      isSupportedByBrowser: g,
      init: i,
      httpRequest: j,
    };
  }),
  (AW4.NativeMessageExtRequestImplementation = function () {
    function y(a, b, d, e, f) {
      var h = {
        request_id: f,
        min_version: n,
        method: a,
        uri_reference: b,
        body: d,
      };
      /select/i.test(b) && (o ? (h.timeout = o) : (h.timeout = c)),
        (g[f] = {
          req: h,
          callback: e,
          response: "",
        }),
        AW4.LogLevel >= AW4.Logger.LEVEL.TRACE &&
          AW4.Logger.trace("Native host impl request: " + JSON.stringify(h)),
        document.dispatchEvent(
          new CustomEvent("AsperaConnectRequest", {
            detail: h,
          })
        );
      return null;
    }
    function x(a) {
      var b;
      a.type == "message" &&
      typeof a.data == "object" &&
      "type" in a.data &&
      a.data.type == "AsperaConnectResponse" &&
      "detail" in a.data
        ? (b = a.data.detail)
        : "detail" in a && (b = a.detail);
      if (b) {
        AW4.LogLevel >= AW4.Logger.LEVEL.TRACE &&
          AW4.Logger.trace(
            "Native host impl received response: " + JSON.stringify(b)
          );
        var c = b.request_id;
        if (!(c in g)) return;
        var d = g[c].callback,
          e = g[c].req.uri_reference;
        if (AW4.Utils.isNullOrUndefinedOrEmpty(d)) return;
        if ("body64" in b) {
          g[c].response += b.body64;
          if (b.complete == !0) {
            var f = AW4.Utils.atou(g[c].response);
            delete g[c], d(b.status, f, c);
          }
        } else delete g[c], d(b.status, b.body, c);
        b.status != 0 && h++;
      }
    }
    function w() {
      clearTimeout(l), clearInterval(m), clearTimeout(j), clearInterval(k);
    }
    function v(b, c) {
      k && (clearInterval(k), (k = null)),
        j && (clearInterval(j), (j = null)),
        b != -1 &&
          (j = setTimeout(function () {
            clearInterval(k), c.timedout && c.timedout();
          }, b));
      var d = 1,
        f = e * 10500,
        g = function () {
          AW4.Logger.debug(
            "Detecting Connect installation via extension. Attempt " + d
          ),
            d++,
            y(
              "GET",
              "/connect/info/version",
              null,
              function (d) {
                d == 503
                  ? (AW4.Logger.debug(
                      "Detected old version of Connect via extension."
                    ),
                    r(a.OUTDATED))
                  : (AW4.Logger.debug(
                      "Detected Connect installation via extension."
                    ),
                    b != -1 && clearTimeout(j),
                    u(),
                    clearInterval(k),
                    c.success && c.success());
              },
              f
            );
        };
      (k = setInterval(g, 1e3)), g();
    }
    function u() {
      AW4.Utils.setLocalStorage(b, Date.now());
    }
    function t() {
      var a = AW4.Utils.getLocalStorage(b);
      return a && a != "";
    }
    function s(a, b) {
      a != -1 &&
        (l = setTimeout(function () {
          clearInterval(m), b.timedout && b.timedout();
        }, a));
      var c = 1,
        d = function () {
          AW4.Logger.debug("Detecting Connect extension. Attempt " + c),
            c++,
            document.dispatchEvent(new CustomEvent("AsperaConnectCheck", {}));
        },
        e = a == -1 ? 1e3 : 200;
      (m = setInterval(d, e)),
        window.addEventListener("message", function c(d) {
          d.type == "message" &&
            typeof d.data == "object" &&
            "type" in d.data &&
            d.data.type == "AsperaConnectCheckResponse" &&
            (window.removeEventListener("message", c),
            AW4.Logger.log("Extension detected: " + JSON.stringify(d.data)),
            a != -1 && clearTimeout(l),
            clearInterval(m),
            b.success && b.success());
        }),
        d();
    }
    function r(a) {
      f != a && ((f = a), d && d(a));
    }
    function q(b) {
      if (!!p()) {
        (n = b.minVersion),
          (o = b.extensionRequestTimeout),
          (e = b.objectId),
          b.requestStatusCallback && (d = b.requestStatusCallback),
          document.addEventListener("AsperaConnectResponse", x),
          window.addEventListener("message", x),
          s(-1, {
            success: function () {
              v(b.initializeTimeout, {
                success: b.callback,
                timedout: function () {
                  f !== a.OUTDATED && r(a.FAILED),
                    v(-1, {
                      success: b.callback,
                      timedout: function () {},
                    });
                },
              });
            },
          }),
          document.addEventListener("AsperaConnectDisconnect", function c(d) {
            AW4.Logger.log("Native host disconnected. Detail: " + d.detail);
            if (f != a.OUTDATED) {
              if (d.detail) {
                var e = !1;
                [
                  "native messaging host not found",
                  "Error when communicating with the native messaging host",
                  "Access to the specified native messaging host is forbidden",
                  "No such native application",
                ].forEach(function (a) {
                  d.detail.indexOf(a) != -1 && (e = !0);
                }),
                  e && i++;
              }
              h == 0 && i == 1
                ? (r(a.FAILED),
                  v(-1, {
                    success: b.callback,
                  }),
                  document.removeEventListener("AsperaConnectDisconnect", c))
                : f != a.DEGRADED &&
                  (r(a.DEGRADED),
                  v(b.initializeTimeout, {
                    success: function () {
                      f = a.RUNNING;
                    },
                    timedout: function () {
                      r(a.FAILED);
                    },
                  }));
            }
          });
        return null;
      }
    }
    function p() {
      if (
        AW4.Utils.BROWSER.CHROME ||
        AW4.Utils.BROWSER.EDGE_WITH_EXTENSION ||
        AW4.Utils.BROWSER.FIREFOX
      )
        return !0;
      return !1;
    }
    var a = AW4.RequestHandler().STATUS,
      b = "aspera-last-detected",
      c = 864e5,
      d,
      e = 0,
      f = 0,
      g = {},
      h = 0,
      i = 0,
      j,
      k,
      l,
      m,
      n,
      o;
    return {
      isSupportedByBrowser: p,
      detectExtension: s,
      init: q,
      httpRequest: y,
      stop: w,
    };
  }),
  (AW4.PPAPIrequestImplementation = function () {
    function p(c, e, f, g, h) {
      if (d != null) {
        var i = b++,
          j = {
            id: h,
            callback: g,
          };
        (a[i] = j),
          d.postMessage({
            id: i,
            method: c,
            url: e,
            data: f,
          });
      }
    }
    function o(a) {
      if (!!g() && d == null) {
        (e = a.callback || function () {}), (c = a.pluginId);
        var b = h(a.containerId);
        i(b);
        var f = j(a.sdkLocation);
        b.appendChild(f), document.body.appendChild(b);
      }
    }
    function n(b) {
      if (typeof b.data == "object") {
        var c = b.data.id;
        if (typeof a[c] == "undefined") return;
        var d = a[c].callback,
          e = a[c].id;
        if (!d) return;
        var f = b.data.status,
          g = b.data.response;
        d(f, g, e), delete a[c];
      }
    }
    function m() {
      (d = document.getElementById(c)), e();
    }
    function l(a) {}
    function k(a) {}
    function j(a) {
      var b = document.createElement("embed");
      b.setAttribute("name", c),
        b.setAttribute("id", c),
        b.setAttribute("path", "plugin/chrome"),
        b.setAttribute(
          "src",
          a.replace(/\/$/, "") + "/plugin/chrome/url_loader.nmf"
        ),
        b.setAttribute("type", f()),
        b.setAttribute("style", "display:inline-block;height:1px;width:1px;");
      return b;
    }
    function i(a) {
      a.addEventListener("load", m, !0),
        a.addEventListener("message", n, !0),
        a.addEventListener("error", k, !0),
        a.addEventListener("crash", l, !0);
    }
    function h(a) {
      var b = document.getElementById(a);
      if (b == null)
        (b = document.createElement("div")),
          b.setAttribute("id", a),
          b.setAttribute("style", "display:inline-block;height:1px;width:1px;");
      else while (b.firstChild) b.removeChild(b.firstChild);
      return b;
    }
    function g() {
      return navigator.mimeTypes[f()] !== undefined;
    }
    function f() {
      return "application/x-pnacl";
    }
    var a = {},
      b = 0,
      c = null,
      d = null,
      e = null;
    return {
      isSupportedByBrowser: g,
      init: o,
      httpRequest: p,
    };
  }),
  (AW4.SafariAppExtRequestImplementation = function () {
    function s(a, b, c, d, f) {
      var g = {
        request_id: f,
        min_version: j,
        method: a,
        uri_reference: b,
        body: c,
      };
      (e[f] = {
        req: g,
        callback: d,
      }),
        document.dispatchEvent(
          new CustomEvent("AsperaConnectRequest", {
            detail: g,
          })
        );
      return null;
    }
    function r(a) {
      if (a.detail) {
        AW4.LogLevel >= AW4.Logger.LEVEL.TRACE &&
          AW4.Logger.trace(
            "Safari extension impl received response: " +
              JSON.stringify(a.detail)
          );
        var c = a.detail.request_id;
        if (!(c in e)) return;
        var d = e[c].callback,
          g = e[c].req.uri_reference;
        delete e[c];
        if (
          a.detail.status == 0 &&
          g.indexOf("/connect/transfers/activity") > 0 &&
          f < b
        )
          f++;
        else {
          f = 0;
          if (AW4.Utils.isNullOrUndefinedOrEmpty(d)) return;
          d(a.detail.status, a.detail.body, c);
        }
      }
    }
    function q(a) {
      if (!!k()) {
        (j = a.minVersion),
          a.requestStatusCallback && (c = a.requestStatusCallback),
          document.addEventListener("AsperaConnectResponse", r),
          n(-1, {
            success: a.callback || function () {},
          });
        return null;
      }
    }
    function p() {
      clearTimeout(h), clearInterval(i);
    }
    function o() {
      var a = document.createElement("IFRAME");
      (a.src = "fasp://initialize?checkextensions"),
        (a.style.visibility = "hidden"),
        (a.style.position = "absolute"),
        (a.style.width = "0px"),
        (a.style.height = "0px"),
        (a.style.border = "0px"),
        document.body.appendChild(a);
    }
    function n(a, b) {
      a != -1 &&
        (h = setTimeout(function () {
          clearInterval(i), b.timedout && b.timedout();
        }, a)),
        document.addEventListener("AsperaConnectCheckResponse", function c(d) {
          d.type === "AsperaConnectCheckResponse" &&
            "detail" in d &&
            typeof d.detail == "object" &&
            (document.removeEventListener("AsperaConnectCheckResponse", c),
            AW4.Logger.log("Extension detected: " + JSON.stringify(d.detail)),
            a != -1 && clearTimeout(h),
            clearInterval(i),
            (g = !0),
            b.success && b.success());
        });
      var c = 1,
        d = a == -1 ? 500 : 200,
        e = function () {
          AW4.Logger.debug("Detecting Connect extension. Attempt " + c),
            c++,
            m();
          var b = document.getElementById("aspera-connect-detector");
          if (b) {
            var d = b.getAttribute("extension-enable");
            d === "true" &&
              (a != -1 && clearTimeout(h),
              clearInterval(i),
              m(),
              setTimeout(function () {
                g || window.postMessage("show_safari_mitigate", "*");
              }, 1e3));
          }
          if (!b) {
            AW4.Logger.debug("Creating detector in sdk...");
            var e = document.createElement("div");
            (e.id = "aspera-connect-detector"),
              e.setAttribute("extension-enable", "false"),
              document.body.appendChild(e);
          }
        };
      (i = setInterval(e, d)), e();
    }
    function m() {
      document.dispatchEvent(new CustomEvent("AsperaConnectCheck", {}));
    }
    function l(a) {
      (d = a), c && c(a);
    }
    function k() {
      if (AW4.Utils.BROWSER.SAFARI_NO_NPAPI) return !0;
      return !1;
    }
    var a = AW4.RequestHandler().STATUS,
      b = 3,
      c,
      d = 0,
      e = {},
      f = 0,
      g = !1,
      h,
      i,
      j;
    return {
      isSupportedByBrowser: k,
      detectExtension: n,
      init: q,
      httpRequest: s,
      stop: p,
    };
  }),
  (AW4.RequestHandler = function () {
    var a = {
        GET: "GET",
        POST: "POST",
      },
      b = {
        INITIALIZING: 0,
        RETRYING: 1,
        RUNNING: 2,
        FAILED: 3,
        STOPPED: 4,
        WAITING: 5,
        OUTDATED: 6,
        DEGRADED: 7,
        EXTENSION_INSTALL: 8,
        toString: function (a) {
          if (a == b.INITIALIZING) return "initializing";
          if (a == b.RETRYING) return "retrying";
          if (a == b.RUNNING) return "running";
          if (a == b.FAILED) return "failed";
          if (a == b.STOPPED) return "stopped";
          if (a == b.WAITING) return "waiting";
          if (a == b.OUTDATED) return "outdated";
          if (a == b.DEGRADED) return "degraded";
          if (a == b.EXTENSION_INSTALL) return "extension installation";
          return "unknown";
        },
      },
      c = 3,
      d = 0,
      e = 0,
      f = null,
      g = null,
      h = {},
      i = [],
      j = null,
      k = "",
      l = 0,
      m = function () {
        while (i.length > 0) {
          var a = i.pop();
          f.httpRequest(
            a.method,
            a.path,
            a.data,
            q,
            a.id,
            AW4.Utils.SESSION_ID
          );
        }
        return null;
      },
      n = function (a) {
        if (g !== b.RUNNING || a !== b.RUNNING) {
          AW4.Logger.debug(
            "[" +
              d +
              "] Request handler status changing from[" +
              b.toString(g) +
              "] to[" +
              b.toString(a) +
              "]"
          ),
            (g = a),
            g == b.RUNNING && m();
          if (g == b.DEGRADED) {
            p();
            return;
          }
          j !== null && j(g);
          return null;
        }
      },
      o = function (c, d, i) {
        delete h[i];
        if (c == 200) {
          var j = AW4.Utils.parseJson(d),
            l = typeof j.error != "undefined";
          if (l) {
            AW4.Logger.error("Failed to parse version response: " + d);
            return;
          }
          AW4.connectVersion = j.version;
        }
        if (!AW4.Utils.checkVersionException()) {
          if (k == "" || AW4.Utils.versionLessThan(k, AW4.MIN_SECURE_VERSION))
            k = AW4.MIN_SECURE_VERSION;
          if (AW4.Utils.versionLessThan(AW4.connectVersion, k)) {
            if (g !== b.OUTDATED) {
              n(b.OUTDATED);
              var i = e++,
                m = a.POST,
                o = "/connect/update/require",
                q = {
                  min_version: k,
                  sdk_location: AW4.Utils.SDK_LOCATION,
                },
                r = {
                  id: i,
                  method: m,
                  path: o,
                  data: null,
                  callbacks: null,
                };
              (h[i] = r),
                f.httpRequest(
                  m,
                  o,
                  JSON.stringify(q),
                  null,
                  i,
                  AW4.Utils.SESSION_ID
                );
            }
            var s = 1,
              t = function () {
                AW4.Logger.debug("Checking for Connect upgrade. Attempt " + s),
                  s++,
                  g !== b.RUNNING
                    ? f.httpRequest(
                        a.GET,
                        "/connect/info/version",
                        null,
                        function (a, b) {
                          var c = AW4.Utils.parseJson(b),
                            d = typeof c.error != "undefined";
                          d
                            ? AW4.Logger.error(
                                "Failed to parse version response: " + b
                              )
                            : AW4.Utils.versionLessThan(c.version, k) ||
                              (AW4.Logger.debug("Updated Connect found."),
                              clearInterval(u),
                              p());
                        },
                        e++
                      )
                    : clearInterval(u);
              },
              u = setInterval(t, 1e3);
            return;
          }
        }
        n(b.RUNNING);
      },
      p = function () {
        var b = e++,
          c = a.GET,
          d = "/connect/info/version",
          g = {
            id: b,
            method: c,
            path: d,
            data: null,
            callbacks: null,
          };
        (h[b] = g), f.httpRequest(a.GET, d, null, o, b, null);
      },
      q = function (a, d, e) {
        if (g == b.STOPPED) {
          AW4.Logger.debug("Connect stopped. Skipping request processing.");
          return null;
        }
        var f = h[e];
        if (!!f) {
          if (a == 0) {
            if (l < c && f.path.indexOf("/connect/transfers/activity") > 0) {
              l++, f.callbacks.error({});
              return;
            }
            i.push(f);
            return null;
          }
          g != b.RUNNING && n(b.RUNNING);
          var j = AW4.Utils.parseJson(d);
          if (a == 200 && typeof j.error == "undefined") {
            l = 0;
            var k = f.callbacks.success;
            k(j);
          } else {
            var k = f.callbacks.error;
            k(j);
          }
          delete h[e];
          return null;
        }
      },
      r = function (a) {
        j = a;
      },
      s = function (a, c, d, j, k) {
        if (g == b.STOPPED) return null;
        if (k == "" || k == null || typeof k == "undefined") k = {};
        typeof k.success != "function" && (k.success = function () {}),
          typeof k.error != "function" && (k.error = function () {});
        var l = e++,
          m = {
            id: l,
            method: a,
            path: c,
            data: d,
            callbacks: k,
          };
        (h[l] = m), g == b.DEGRADED && p();
        if (g != b.RUNNING) {
          i.push(m);
          return null;
        }
        f.httpRequest(a, c, d, q, l);
        return null;
      },
      t = function (a) {
        function l() {
          AW4.Utils.BROWSER.FIREFOX || AW4.Utils.BROWSER.SAFARI_NO_NPAPI
            ? AW4.Logger.error(
                "Using http request implementation is not supported in this browser. Application should upgrade to extension implementation."
              )
            : AW4.Logger.warn(
                "Warning: Using http request implementation. Application should upgrade to extension implementation."
              ),
            j(),
            i(new AW4.XMLhttpRequestImplementation());
        }
        function j() {
          var c = function () {
            g != b.RUNNING &&
              g != b.OUTDATED &&
              (AW4.Logger.log(
                "Connect detection timed out after: " +
                  a.initializeTimeout +
                  "ms"
              ),
              n(b.FAILED));
          };
          setTimeout(c, a.initializeTimeout);
        }
        function i(a) {
          f = a;
          if (!f.isSupportedByBrowser())
            return AW4.Utils.createError(-1, "This browser is not supported");
          f.init(c);
        }
        n(b.INITIALIZING), (k = a.minVersion), (d = a.objectId), (e = d * 1e4);
        var c = {
            pluginId: a.pluginId,
            containerId: a.containerId,
            initializeTimeout: a.initializeTimeout,
            sdkLocation: a.sdkLocation,
            minVersion: a.minVersion,
            extensionRequestTimeout: a.extensionRequestTimeout,
            callback: p,
            requestStatusCallback: n,
            objectId: a.objectId,
          },
          h = new AW4.NPAPIrequestImplementation();
        if (h.isSupportedByBrowser()) (f = h), f.init(c);
        else {
          var m;
          AW4.Utils.BROWSER.SAFARI_NO_NPAPI
            ? (m = new AW4.SafariAppExtRequestImplementation())
            : (m = new AW4.NativeMessageExtRequestImplementation()),
            (f = m);
          if (
            a.connectMethod == "http" ||
            !m.isSupportedByBrowser() ||
            AW4.Utils.checkVersionException()
          )
            l();
          else {
            var o =
              typeof AW4.ConnectInstaller != "undefined" &&
              AW4.ConnectInstaller.supportsInstallingExtensions == !0;
            m.detectExtension(1e3, {
              success: function () {
                i(m);
              },
              timedout: function () {
                a.connectMethod == "extension" || o
                  ? (AW4.Utils.BROWSER.SAFARI_NO_NPAPI
                      ? j()
                      : (n(b.EXTENSION_INSTALL),
                        window.postMessage("show_extension_install", "*")),
                    i(m))
                  : l();
              },
            }),
              window.addEventListener(
                "message",
                function (a) {
                  g != b.RUNNING && a.data == "continue" && (m.stop(), l());
                },
                !1
              );
          }
        }
      },
      u = function () {
        (g = b.STOPPED), typeof f.stop == "function" && f.stop();
        return !0;
      };
    return {
      HTTP_METHOD: a,
      STATUS: b,
      init: t,
      start: s,
      addStatusListener: r,
      stopRequests: u,
    };
  }),
  (AW4.MIN_SECURE_VERSION = "3.8.0"),
  (AW4.Connect = function (a) {
    function H(a) {
      a == r.STATUS.RUNNING &&
        k &&
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/file/initialize-drag-drop",
          null,
          AW4.Utils.SESSION_ID,
          null
        ),
        a == r.STATUS.INITIALIZING
          ? G(AW4.Connect.STATUS.INITIALIZING)
          : a == r.STATUS.RETRYING
          ? G(AW4.Connect.STATUS.RETRYING)
          : a == r.STATUS.FAILED
          ? G(AW4.Connect.STATUS.FAILED)
          : a == r.STATUS.EXTENSION_INSTALL
          ? G(AW4.Connect.STATUS.EXTENSION_INSTALL)
          : a != r.STATUS.WAITING &&
            (a == r.STATUS.OUTDATED
              ? t != AW4.Connect.STATUS.OUTDATED &&
                G(AW4.Connect.STATUS.OUTDATED)
              : G(AW4.Connect.STATUS.RUNNING)),
        F(t);
    }
    function G(a) {
      AW4.Logger.debug(
        "[" + u + "] Connect status changing from[" + t + "] to[" + a + "]"
      ),
        (t = a);
    }
    function F(a) {
      for (var b = 0; b < s.length; b++)
        var c = s[b](AW4.Connect.EVENT.STATUS, a);
    }
    function E(a) {
      var b = 0,
        c = a.length,
        d = Object.create(null),
        e = AW4.Utils.safeSplit(a, "");
      e.forEach(function (a) {
        d[a] ? (d[a] += 1) : (d[a] = 1);
      });
      for (var f in d) {
        var g = d[f] / c;
        b -= g * (Math.log(g) / Math.log(2));
      }
      return b > 3.8;
    }
    function D(a, b) {
      var c = !1,
        d = b.indexOf(a);
      while (d > -1) b.splice(d, 1), (c = !0), (d = b.indexOf(a));
      return c;
    }
    function C() {
      v < l
        ? (v++,
          A(q, {
            success: function (a) {
              v--, B(a);
            },
            error: function () {
              v--;
            },
          }))
        : AW4.Logger.debug(
            "Skipping activity request. Reached maximum number of outstanding polling requests."
          );
    }
    function B(a) {
      q = a.iteration_token;
      for (var b = 0; b < o.length; b++) o[b](AW4.Connect.EVENT.TRANSFER, a);
    }
    function A(a, b) {
      if (w(a)) return null;
      var c = {
        iteration_token: a,
      };
      return y(
        AW4.Connect.HTTP_METHOD.POST,
        "/connect/transfers/activity",
        c,
        AW4.Utils.SESSION_ID,
        b
      );
    }
    function z(a, b, c, d, e) {
      if (r == null) return null;
      var f = JSON.stringify(c);
      r.start(a, b, f, d, e);
      return null;
    }
    function y(a, b, c, d, e) {
      if (r == null) {
        console.error(
          "Connect#initSession must be called before invoking Connect API[" +
            b +
            "]."
        );
        return null;
      }
      var f = {};
      if (!w(c)) for (var g in c) c.hasOwnProperty(g) && (f[g] = c[g]);
      var h = JSON.stringify(x(f));
      r.start(a, b, h, d, e);
      return null;
    }
    function x(a) {
      g.length !== 0 && (a.authorization_key = g),
        w(a.aspera_connect_settings) && (a.aspera_connect_settings = {}),
        (a.aspera_connect_settings.app_id = f);
      return a;
    }
    function w(a) {
      return a === "" || a === null || typeof a == "undefined";
    }
    w(a) && (a = {}),
      (AW4.Connect.HTTP_METHOD = {
        GET: "GET",
        POST: "POST",
        DELETE: "DELETE",
        REVERT: "REVERT",
      }),
      (AW4.Connect.STATUS = {
        INITIALIZING: "INITIALIZING",
        RETRYING: "RETRYING",
        RUNNING: "RUNNING",
        OUTDATED: "OUTDATED",
        FAILED: "FAILED",
        EXTENSION_INSTALL: "EXTENSION_INSTALL",
      }),
      (AW4.Connect.EVENT = {
        ALL: "all",
        TRANSFER: "transfer",
        STATUS: "status",
      }),
      (AW4.Connect.TRANSFER_STATUS = {
        CANCELLED: "cancelled",
        COMPLETED: "completed",
        FAILED: "failed",
        INITIATING: "initiating",
        QUEUED: "queued",
        REMOVED: "removed",
        RUNNING: "running",
        WILLRETRY: "willretry",
      });
    var b = a.connectLaunchWaitTimeoutMs || 5e3,
      c = a.id || "aspera-web",
      d = a.containerId || "aspera-web-container",
      e =
        AW4.Utils.getFullURI(a.sdkLocation) ||
        "//d3gcli72yxqn2z.cloudfront.net/connect/v4",
      f = "",
      g = a.authorizationKey || "",
      h = a.pollingTime || 2e3,
      i = a.minVersion || AW4.MIN_SECURE_VERSION,
      j = a.connectMethod || "",
      k = a.dragDropEnabled || !1,
      l = a.maxActivityOutstanding || 2,
      m = a.extensionRequestTimeout;
    (AW4.Utils.CURRENT_API = AW4.Utils.FASP_API),
      (AW4.Utils.SDK_LOCATION = e),
      typeof AW4.connectVersion == "undefined" && (AW4.connectVersion = ""),
      a.minVersion && (AW4.MIN_REQUESTED_VERSION = a.minVersion);
    var n = AW4.Utils.getLocalStorage("aspera-connect-method");
    n && (j = n), (a.addStandardSettings = x);
    var o = [],
      p = 0,
      q = 0,
      r = null,
      s = [],
      t = AW4.Connect.STATUS.INITIALIZING,
      u = AW4.Utils.nextObjectId(),
      v = 0;
    (this.connectHttpRequest = y),
      (this.driveHttpRequest = z),
      (this.isNullOrUndefinedOrEmpty = w),
      (this.addEventListener = function (a, b) {
        if (typeof a != typeof AW4.Connect.EVENT.ALL)
          return AW4.Utils.createError(-1, "Invalid EVENT parameter");
        if (typeof b != "function")
          return AW4.Utils.createError(-1, "Invalid Listener parameter");
        if (a == AW4.Connect.EVENT.TRANSFER || a == AW4.Connect.EVENT.ALL)
          p === 0 && (p = setInterval(C, h)), o.push(b);
        (a == AW4.Connect.EVENT.STATUS || a == AW4.Connect.EVENT.ALL) &&
          s.push(b);
        return null;
      }),
      (this.authenticate = function (a, b) {
        if (w(a))
          return AW4.Utils.createError(-1, "Invalid authSpec parameter");
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/info/authenticate",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.getAllTransfers = function (a, b) {
        w(b) && (b = 0), A(b, a);
        return null;
      }),
      (this.getStatus = function () {
        return t;
      }),
      (this.getTransfer = function (a, b) {
        if (
          w(a) ||
          !/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/i.test(
            a
          )
        )
          return AW4.Utils.createError(-1, "Invalid transferId parameter.");
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/info/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.initSession = function (a) {
        if (w(f))
          w(a)
            ? ((f = AW4.Utils.getLocalStorage(AW4.Utils.LS_CONNECT_APP_ID)),
              w(f) &&
                ((f = AW4.Utils.utoa(AW4.Utils.generateUuid())),
                AW4.Utils.setLocalStorage(AW4.Utils.LS_CONNECT_APP_ID, f)))
            : (f = a);
        else
          return AW4.Utils.createError(-1, "Session was already initialized");
        E(f) ||
          AW4.Logger.warn("WARNING: app_id field entropy might be too low.");
        var b = this.start();
        if (b == null)
          return {
            app_id: f,
          };
        return b;
      }),
      (this.modifyTransfer = function (a, b, c) {
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/modify/" + a,
          b,
          AW4.Utils.SESSION_ID,
          c
        );
        return null;
      }),
      (this.readAsArrayBuffer = function (a, b) {
        console.warn(
          "AW4.Connect#readAsArrayBuffer will be deprecated in the future."
        );
        var c = {};
        if (!a) return AW4.Utils.createError(-1, "Invalid options parameter");
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/file/read-as-array-buffer/",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.readChunkAsArrayBuffer = function (a, b) {
        console.warn(
          "AW4.Connect#readChunkAsArrayBuffer will be deprecated in the future."
        );
        if (
          !a.path ||
          typeof a.offset == "undefined" ||
          typeof a.chunkSize == "undefined"
        )
          return AW4.Utils.createError(-1, "Invalid parameters");
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/file/read-chunk-as-array-buffer/",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.removeEventListener = function (a, b) {
        var c = !1;
        if (typeof a == "undefined")
          o.length > 0 && ((o = []), (c = !0)),
            s.length > 0 && ((s = []), (c = !0));
        else if (typeof a != typeof AW4.Connect.EVENT.ALL)
          (c = c || D(a, o)), (c = c || D(a, s));
        else if (typeof b != "function")
          (a === AW4.Connect.EVENT.TRANSFER || a === AW4.Connect.EVENT.ALL) &&
            o.length > 0 &&
            ((o = []), (c = !0)),
            (a === AW4.Connect.EVENT.STATUS || a === AW4.Connect.EVENT.ALL) &&
              s.length > 0 &&
              ((s = []), (c = !0));
        else {
          if (a === AW4.Connect.EVENT.TRANSFER || a === AW4.Connect.EVENT.ALL)
            c = c || D(b, o);
          if (a === AW4.Connect.EVENT.STATUS || a === AW4.Connect.EVENT.ALL)
            c = c || D(b, s);
        }
        o.length === 0 && (clearInterval(p), (p = 0));
        return c;
      }),
      (this.removeTransfer = function (a, b) {
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/remove/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.resumeTransfer = function (a, b, c) {
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/resume/" + a,
          b,
          AW4.Utils.SESSION_ID,
          c
        );
        return null;
      }),
      (this.setDragDropTargets = function (a, b, c) {
        if (!k)
          return AW4.Utils.createError(
            -1,
            "Drop is not enabled in the initialization options, please instantiate Connect again with the dragDropEnabled option set to true."
          );
        if (typeof c != "function")
          return AW4.Utils.createError(-1, "You must provide a valid listener");
        if (w(b))
          return AW4.Utils.createError(
            -1,
            "You must provide a valid options object"
          );
        var d = document.querySelectorAll(a);
        if (d.length == 0)
          return AW4.Utils.createError(
            -1,
            "No valid elements for the selector given"
          );
        var e = function (a) {
            a.stopPropagation(),
              a.preventDefault(),
              c({
                event: a,
              });
          },
          f = function (a) {
            a.stopPropagation(),
              a.preventDefault(),
              b.dragOver == !0 &&
                c({
                  event: a,
                });
          },
          g = function (a) {
            a.stopPropagation(), a.preventDefault();
            var b = a.dataTransfer.files,
              d = {};
            (d.dataTransfer = {}), (d.dataTransfer.files = []);
            for (var e = 0; e < b.length; e++) {
              var f = {
                lastModifiedDate: b[e].lastModifiedDate,
                name: b[e].name,
                size: b[e].size,
                type: b[e].type,
              };
              d.dataTransfer.files.push(f);
            }
            var g = function (b) {
              c({
                event: a,
                files: b,
              });
            };
            y(
              AW4.Connect.HTTP_METHOD.POST,
              "/connect/file/dropped-files",
              d,
              AW4.Utils.SESSION_ID,
              {
                success: g,
              }
            );
          };
        for (var h = 0; h < d.length; h++)
          b.dragEnter == !0 && d[h].addEventListener("dragenter", e),
            b.dragLeave == !0 && d[h].addEventListener("dragleave", e),
            (b.dragOver == !0 || b.drop !== !1) &&
              d[h].addEventListener("dragover", f),
            b.drop !== !1 && d[h].addEventListener("drop", g);
        return null;
      }),
      (this.showAbout = function (a) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/windows/about",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      }),
      (this.showDirectory = function (a, b) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/windows/finder/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.showPreferences = function (a) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/windows/preferences",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      }),
      (this.showPreferencesPage = function (a, b) {
        var c = ["general", "transfers", "bandwidth", "network", "security"];
        a && a.page && c.indexOf(a.page) > -1
          ? y(
              AW4.Connect.HTTP_METHOD.GET,
              "/connect/windows/preferences/" + a.page,
              null,
              AW4.Utils.SESSION_ID,
              b
            )
          : AW4.Logger.error(
              "#showPreferencesPage options argument is either missing or incorrect."
            );
        return null;
      }),
      (this.showSaveFileDialog = function (a, b) {
        var c = {};
        w(b) && (b = {}),
          (c.title = b.title || ""),
          (c.suggestedName = b.suggestedName || ""),
          (c.allowedFileTypes = b.allowedFileTypes || ""),
          y(
            AW4.Connect.HTTP_METHOD.POST,
            "/connect/windows/select-save-file-dialog/",
            c,
            AW4.Utils.SESSION_ID,
            a
          );
        return null;
      }),
      (this.showSelectFileDialog = function (a, b) {
        var c = {};
        w(b) && (b = {}),
          (c.title = b.title || ""),
          (c.suggestedName = b.suggestedName || ""),
          (c.allowMultipleSelection =
            w(b.allowMultipleSelection) || b.allowMultipleSelection),
          (c.allowedFileTypes = b.allowedFileTypes || ""),
          y(
            AW4.Connect.HTTP_METHOD.POST,
            "/connect/windows/select-open-file-dialog/",
            c,
            AW4.Utils.SESSION_ID,
            a
          );
        return null;
      }),
      (this.showSelectFolderDialog = function (a, b) {
        var c = {};
        w(b) && (b = {}),
          (c.title = b.title || ""),
          (c.allowMultipleSelection =
            w(b.allowMultipleSelection) || b.allowMultipleSelection),
          y(
            AW4.Connect.HTTP_METHOD.POST,
            "/connect/windows/select-open-folder-dialog/",
            c,
            AW4.Utils.SESSION_ID,
            a
          );
        return null;
      }),
      (this.showTransferManager = function (a) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/windows/transfer-manager",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      }),
      (this.showTransferMonitor = function (a, b) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/windows/transfer-monitor/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.start = function () {
        if (f == "")
          return AW4.Utils.createError(-1, "Please call initSession first");
        (r = new AW4.RequestHandler()), r.addStatusListener(H);
        var a = {
          pluginId: c,
          containerId: d,
          initializeTimeout: b,
          sdkLocation: e,
          connectMethod: j,
          minVersion: i,
          extensionRequestTimeout: m,
          objectId: u,
        };
        return r.init(a);
      }),
      (this.startTransfer = function (a, b, c) {
        if (w(a))
          return AW4.Utils.createError(-1, "Invalid transferSpec parameter");
        b = b || {};
        var d = {
          transfer_specs: [
            {
              transfer_spec: a,
              aspera_connect_settings: b,
            },
          ],
        };
        return this.startTransfers(d, c);
      }),
      (this.startTransfers = function (a, b) {
        if (w(a))
          return AW4.Utils.createError(-1, "Invalid transferSpecs parameter");
        var c, d, e, f;
        d = AW4.Utils.generateUuid();
        for (c = 0; c < a.transfer_specs.length; c++)
          (f = a.transfer_specs[c]),
            x(f),
            (f.aspera_connect_settings.request_id = d),
            w(f.aspera_connect_settings.back_link) &&
              (f.aspera_connect_settings.back_link = window.location.href);
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/start",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return {
          request_id: d,
        };
      }),
      (this.stop = function () {
        return r.stopRequests();
      }),
      (this.stopTransfer = function (a, b) {
        y(
          AW4.Connect.HTTP_METHOD.POST,
          "/connect/transfers/stop/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.version = function (a) {
        if (w(a)) return null;
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/connect/info/version",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      }),
      (this.invalidUri = function (a) {
        y(
          AW4.Connect.HTTP_METHOD.GET,
          "/invalid/uri",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      });
  }),
  (AW4.Drive = function (a) {
    AW4.Connect.call(this, a),
      (AW4.Utils.CURRENT_API = AW4.Utils.DRIVE_API),
      (this.accounts = function (a) {
        if (this.isNullOrUndefinedOrEmpty(a)) return null;
        this.driveHttpRequest(
          AW4.Connect.HTTP_METHOD.GET,
          "/account",
          null,
          AW4.Utils.SESSION_ID,
          a
        );
        return null;
      }),
      (this.accountById = function (a, b) {
        if (this.isNullOrUndefinedOrEmpty(b)) return null;
        this.driveHttpRequest(
          AW4.Connect.HTTP_METHOD.GET,
          "/account/" + a,
          null,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.checkoutFilesByIdPath = function (a, b) {
        if (this.isNullOrUndefinedOrEmpty(b)) return null;
        this.driveHttpRequest(
          AW4.Connect.HTTP_METHOD.POST,
          "/checkouts",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.checkinCheckouts = function (a, b) {
        if (this.isNullOrUndefinedOrEmpty(b)) return null;
        this.driveHttpRequest(
          AW4.Connect.HTTP_METHOD.DELETE,
          "/checkouts",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      }),
      (this.revertCheckouts = function (a, b) {
        if (this.isNullOrUndefinedOrEmpty(b)) return null;
        this.driveHttpRequest(
          AW4.Connect.HTTP_METHOD.REVERT,
          "/checkouts",
          a,
          AW4.Utils.SESSION_ID,
          b
        );
        return null;
      });
  }),
  "use strict";
if (typeof AW4 == "undefined") var AW4 = {};
AW4.crypt = (function (a) {
  function H(a) {
    a = d(a, !0);
    if (a.length < 16) throw new Error("PKCS#7 invalid length");
    var b = a[a.length - 1];
    if (b > 16) throw new Error("PKCS#7 padding byte out of range");
    var c = a.length - b;
    for (var g = 0; g < b; g++)
      if (a[c + g] !== b) throw new Error("PKCS#7 invalid padding byte");
    var h = e(c);
    f(a, h, 0, 0, c);
    return h;
  }
  function G(a) {
    a = d(a, !0);
    var b = 16 - (a.length % 16),
      c = e(a.length + b);
    f(a, c);
    for (var g = a.length; g < c.length; g++) c[g] = b;
    return c;
  }
  function y(a) {
    var b = [];
    for (var c = 0; c < a.length; c += 4)
      b.push((a[c] << 24) | (a[c + 1] << 16) | (a[c + 2] << 8) | a[c + 3]);
    return b;
  }
  function f(a, b, c, d, e) {
    if (d != null || e != null)
      a.slice ? (a = a.slice(d, e)) : (a = Array.prototype.slice.call(a, d, e));
    b.set(a, c);
  }
  function e(a) {
    return new Uint8Array(a);
  }
  function d(a, d) {
    if (a.buffer && ArrayBuffer.isView(a) && a.name === "Uint8Array") {
      d && (a.slice ? (a = a.slice()) : (a = Array.prototype.slice.call(a)));
      return a;
    }
    if (Array.isArray(a)) {
      if (!c(a)) throw new Error("Array contains invalid value: " + a);
      return new Uint8Array(a);
    }
    if (b(a.length) && c(a)) return new Uint8Array(a);
    throw new Error("unsupported array-like object");
  }
  function c(a) {
    if (!b(a.length)) return !1;
    for (var c = 0; c < a.length; c++)
      if (!b(a[c]) || a[c] < 0 || a[c] > 255) return !1;
    return !0;
  }
  function b(a) {
    return parseInt(a) === a;
  }
  var g = (function () {
      function b(a) {
        var b = [],
          c = 0;
        while (c < a.length) {
          var d = a[c];
          d < 128
            ? (b.push(String.fromCharCode(d)), c++)
            : d > 191 && d < 224
            ? (b.push(String.fromCharCode(((d & 31) << 6) | (a[c + 1] & 63))),
              (c += 2))
            : (b.push(
                String.fromCharCode(
                  ((d & 15) << 12) | ((a[c + 1] & 63) << 6) | (a[c + 2] & 63)
                )
              ),
              (c += 3));
        }
        return b.join("");
      }
      function a(a) {
        var b = [],
          c = 0;
        a = encodeURI(a);
        while (c < a.length) {
          var e = a.charCodeAt(c++);
          e === 37
            ? (b.push(parseInt(a.substr(c, 2), 16)), (c += 2))
            : b.push(e);
        }
        return d(b);
      }
      return {
        toBytes: a,
        fromBytes: b,
      };
    })(),
    h = (function () {
      function c(a) {
        var c = [];
        for (var d = 0; d < a.length; d++) {
          var e = a[d];
          c.push(b[(e & 240) >> 4] + b[e & 15]);
        }
        return c.join("");
      }
      function a(a) {
        var b = [];
        for (var c = 0; c < a.length; c += 2)
          b.push(parseInt(a.substr(c, 2), 16));
        return b;
      }
      var b = "0123456789abcdef";
      return {
        toBytes: a,
        fromBytes: c,
      };
    })(),
    i = {
      16: 10,
      24: 12,
      32: 14,
    },
    j = [
      1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77, 154, 47, 94, 188,
      99, 198, 151, 53, 106, 212, 179, 125, 250, 239, 197, 145,
    ],
    k = [
      99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
      202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114,
      192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49,
      21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117,
      9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83,
      209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208,
      239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81,
      163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210,
      205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115,
      96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219,
      224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121,
      231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8,
      186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138,
      112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158,
      225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40,
      223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187,
      22,
    ],
    l = [
      82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215, 251,
      124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222, 233, 203,
      84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66, 250, 195, 78, 8,
      46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73, 109, 139, 209, 37, 114,
      248, 246, 100, 134, 104, 152, 22, 212, 164, 92, 204, 93, 101, 182, 146,
      108, 112, 72, 80, 253, 237, 185, 218, 94, 21, 70, 87, 167, 141, 157, 132,
      144, 216, 171, 0, 140, 188, 211, 10, 247, 228, 88, 5, 184, 179, 69, 6,
      208, 44, 30, 143, 202, 63, 15, 2, 193, 175, 189, 3, 1, 19, 138, 107, 58,
      145, 17, 65, 79, 103, 220, 234, 151, 242, 207, 206, 240, 180, 230, 115,
      150, 172, 116, 34, 231, 173, 53, 133, 226, 249, 55, 232, 28, 117, 223,
      110, 71, 241, 26, 113, 29, 41, 197, 137, 111, 183, 98, 14, 170, 24, 190,
      27, 252, 86, 62, 75, 198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90,
      244, 31, 221, 168, 51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95,
      96, 81, 127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239,
      160, 224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97,
      23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12, 125,
    ],
    m = [
      3328402341, 4168907908, 4000806809, 4135287693, 4294111757, 3597364157,
      3731845041, 2445657428, 1613770832, 33620227, 3462883241, 1445669757,
      3892248089, 3050821474, 1303096294, 3967186586, 2412431941, 528646813,
      2311702848, 4202528135, 4026202645, 2992200171, 2387036105, 4226871307,
      1101901292, 3017069671, 1604494077, 1169141738, 597466303, 1403299063,
      3832705686, 2613100635, 1974974402, 3791519004, 1033081774, 1277568618,
      1815492186, 2118074177, 4126668546, 2211236943, 1748251740, 1369810420,
      3521504564, 4193382664, 3799085459, 2883115123, 1647391059, 706024767,
      134480908, 2512897874, 1176707941, 2646852446, 806885416, 932615841,
      168101135, 798661301, 235341577, 605164086, 461406363, 3756188221,
      3454790438, 1311188841, 2142417613, 3933566367, 302582043, 495158174,
      1479289972, 874125870, 907746093, 3698224818, 3025820398, 1537253627,
      2756858614, 1983593293, 3084310113, 2108928974, 1378429307, 3722699582,
      1580150641, 327451799, 2790478837, 3117535592, 0, 3253595436, 1075847264,
      3825007647, 2041688520, 3059440621, 3563743934, 2378943302, 1740553945,
      1916352843, 2487896798, 2555137236, 2958579944, 2244988746, 3151024235,
      3320835882, 1336584933, 3992714006, 2252555205, 2588757463, 1714631509,
      293963156, 2319795663, 3925473552, 67240454, 4269768577, 2689618160,
      2017213508, 631218106, 1269344483, 2723238387, 1571005438, 2151694528,
      93294474, 1066570413, 563977660, 1882732616, 4059428100, 1673313503,
      2008463041, 2950355573, 1109467491, 537923632, 3858759450, 4260623118,
      3218264685, 2177748300, 403442708, 638784309, 3287084079, 3193921505,
      899127202, 2286175436, 773265209, 2479146071, 1437050866, 4236148354,
      2050833735, 3362022572, 3126681063, 840505643, 3866325909, 3227541664,
      427917720, 2655997905, 2749160575, 1143087718, 1412049534, 999329963,
      193497219, 2353415882, 3354324521, 1807268051, 672404540, 2816401017,
      3160301282, 369822493, 2916866934, 3688947771, 1681011286, 1949973070,
      336202270, 2454276571, 201721354, 1210328172, 3093060836, 2680341085,
      3184776046, 1135389935, 3294782118, 965841320, 831886756, 3554993207,
      4068047243, 3588745010, 2345191491, 1849112409, 3664604599, 26054028,
      2983581028, 2622377682, 1235855840, 3630984372, 2891339514, 4092916743,
      3488279077, 3395642799, 4101667470, 1202630377, 268961816, 1874508501,
      4034427016, 1243948399, 1546530418, 941366308, 1470539505, 1941222599,
      2546386513, 3421038627, 2715671932, 3899946140, 1042226977, 2521517021,
      1639824860, 227249030, 260737669, 3765465232, 2084453954, 1907733956,
      3429263018, 2420656344, 100860677, 4160157185, 470683154, 3261161891,
      1781871967, 2924959737, 1773779408, 394692241, 2579611992, 974986535,
      664706745, 3655459128, 3958962195, 731420851, 571543859, 3530123707,
      2849626480, 126783113, 865375399, 765172662, 1008606754, 361203602,
      3387549984, 2278477385, 2857719295, 1344809080, 2782912378, 59542671,
      1503764984, 160008576, 437062935, 1707065306, 3622233649, 2218934982,
      3496503480, 2185314755, 697932208, 1512910199, 504303377, 2075177163,
      2824099068, 1841019862, 739644986,
    ],
    n = [
      2781242211, 2230877308, 2582542199, 2381740923, 234877682, 3184946027,
      2984144751, 1418839493, 1348481072, 50462977, 2848876391, 2102799147,
      434634494, 1656084439, 3863849899, 2599188086, 1167051466, 2636087938,
      1082771913, 2281340285, 368048890, 3954334041, 3381544775, 201060592,
      3963727277, 1739838676, 4250903202, 3930435503, 3206782108, 4149453988,
      2531553906, 1536934080, 3262494647, 484572669, 2923271059, 1783375398,
      1517041206, 1098792767, 49674231, 1334037708, 1550332980, 4098991525,
      886171109, 150598129, 2481090929, 1940642008, 1398944049, 1059722517,
      201851908, 1385547719, 1699095331, 1587397571, 674240536, 2704774806,
      252314885, 3039795866, 151914247, 908333586, 2602270848, 1038082786,
      651029483, 1766729511, 3447698098, 2682942837, 454166793, 2652734339,
      1951935532, 775166490, 758520603, 3000790638, 4004797018, 4217086112,
      4137964114, 1299594043, 1639438038, 3464344499, 2068982057, 1054729187,
      1901997871, 2534638724, 4121318227, 1757008337, 0, 750906861, 1614815264,
      535035132, 3363418545, 3988151131, 3201591914, 1183697867, 3647454910,
      1265776953, 3734260298, 3566750796, 3903871064, 1250283471, 1807470800,
      717615087, 3847203498, 384695291, 3313910595, 3617213773, 1432761139,
      2484176261, 3481945413, 283769337, 100925954, 2180939647, 4037038160,
      1148730428, 3123027871, 3813386408, 4087501137, 4267549603, 3229630528,
      2315620239, 2906624658, 3156319645, 1215313976, 82966005, 3747855548,
      3245848246, 1974459098, 1665278241, 807407632, 451280895, 251524083,
      1841287890, 1283575245, 337120268, 891687699, 801369324, 3787349855,
      2721421207, 3431482436, 959321879, 1469301956, 4065699751, 2197585534,
      1199193405, 2898814052, 3887750493, 724703513, 2514908019, 2696962144,
      2551808385, 3516813135, 2141445340, 1715741218, 2119445034, 2872807568,
      2198571144, 3398190662, 700968686, 3547052216, 1009259540, 2041044702,
      3803995742, 487983883, 1991105499, 1004265696, 1449407026, 1316239930,
      504629770, 3683797321, 168560134, 1816667172, 3837287516, 1570751170,
      1857934291, 4014189740, 2797888098, 2822345105, 2754712981, 936633572,
      2347923833, 852879335, 1133234376, 1500395319, 3084545389, 2348912013,
      1689376213, 3533459022, 3762923945, 3034082412, 4205598294, 133428468,
      634383082, 2949277029, 2398386810, 3913789102, 403703816, 3580869306,
      2297460856, 1867130149, 1918643758, 607656988, 4049053350, 3346248884,
      1368901318, 600565992, 2090982877, 2632479860, 557719327, 3717614411,
      3697393085, 2249034635, 2232388234, 2430627952, 1115438654, 3295786421,
      2865522278, 3633334344, 84280067, 33027830, 303828494, 2747425121,
      1600795957, 4188952407, 3496589753, 2434238086, 1486471617, 658119965,
      3106381470, 953803233, 334231800, 3005978776, 857870609, 3151128937,
      1890179545, 2298973838, 2805175444, 3056442267, 574365214, 2450884487,
      550103529, 1233637070, 4289353045, 2018519080, 2057691103, 2399374476,
      4166623649, 2148108681, 387583245, 3664101311, 836232934, 3330556482,
      3100665960, 3280093505, 2955516313, 2002398509, 287182607, 3413881008,
      4238890068, 3597515707, 975967766,
    ],
    o = [
      1671808611, 2089089148, 2006576759, 2072901243, 4061003762, 1807603307,
      1873927791, 3310653893, 810573872, 16974337, 1739181671, 729634347,
      4263110654, 3613570519, 2883997099, 1989864566, 3393556426, 2191335298,
      3376449993, 2106063485, 4195741690, 1508618841, 1204391495, 4027317232,
      2917941677, 3563566036, 2734514082, 2951366063, 2629772188, 2767672228,
      1922491506, 3227229120, 3082974647, 4246528509, 2477669779, 644500518,
      911895606, 1061256767, 4144166391, 3427763148, 878471220, 2784252325,
      3845444069, 4043897329, 1905517169, 3631459288, 827548209, 356461077,
      67897348, 3344078279, 593839651, 3277757891, 405286936, 2527147926,
      84871685, 2595565466, 118033927, 305538066, 2157648768, 3795705826,
      3945188843, 661212711, 2999812018, 1973414517, 152769033, 2208177539,
      745822252, 439235610, 455947803, 1857215598, 1525593178, 2700827552,
      1391895634, 994932283, 3596728278, 3016654259, 695947817, 3812548067,
      795958831, 2224493444, 1408607827, 3513301457, 0, 3979133421, 543178784,
      4229948412, 2982705585, 1542305371, 1790891114, 3410398667, 3201918910,
      961245753, 1256100938, 1289001036, 1491644504, 3477767631, 3496721360,
      4012557807, 2867154858, 4212583931, 1137018435, 1305975373, 861234739,
      2241073541, 1171229253, 4178635257, 33948674, 2139225727, 1357946960,
      1011120188, 2679776671, 2833468328, 1374921297, 2751356323, 1086357568,
      2408187279, 2460827538, 2646352285, 944271416, 4110742005, 3168756668,
      3066132406, 3665145818, 560153121, 271589392, 4279952895, 4077846003,
      3530407890, 3444343245, 202643468, 322250259, 3962553324, 1608629855,
      2543990167, 1154254916, 389623319, 3294073796, 2817676711, 2122513534,
      1028094525, 1689045092, 1575467613, 422261273, 1939203699, 1621147744,
      2174228865, 1339137615, 3699352540, 577127458, 712922154, 2427141008,
      2290289544, 1187679302, 3995715566, 3100863416, 339486740, 3732514782,
      1591917662, 186455563, 3681988059, 3762019296, 844522546, 978220090,
      169743370, 1239126601, 101321734, 611076132, 1558493276, 3260915650,
      3547250131, 2901361580, 1655096418, 2443721105, 2510565781, 3828863972,
      2039214713, 3878868455, 3359869896, 928607799, 1840765549, 2374762893,
      3580146133, 1322425422, 2850048425, 1823791212, 1459268694, 4094161908,
      3928346602, 1706019429, 2056189050, 2934523822, 135794696, 3134549946,
      2022240376, 628050469, 779246638, 472135708, 2800834470, 3032970164,
      3327236038, 3894660072, 3715932637, 1956440180, 522272287, 1272813131,
      3185336765, 2340818315, 2323976074, 1888542832, 1044544574, 3049550261,
      1722469478, 1222152264, 50660867, 4127324150, 236067854, 1638122081,
      895445557, 1475980887, 3117443513, 2257655686, 3243809217, 489110045,
      2662934430, 3778599393, 4162055160, 2561878936, 288563729, 1773916777,
      3648039385, 2391345038, 2493985684, 2612407707, 505560094, 2274497927,
      3911240169, 3460925390, 1442818645, 678973480, 3749357023, 2358182796,
      2717407649, 2306869641, 219617805, 3218761151, 3862026214, 1120306242,
      1756942440, 1103331905, 2578459033, 762796589, 252780047, 2966125488,
      1425844308, 3151392187, 372911126,
    ],
    p = [
      1667474886, 2088535288, 2004326894, 2071694838, 4075949567, 1802223062,
      1869591006, 3318043793, 808472672, 16843522, 1734846926, 724270422,
      4278065639, 3621216949, 2880169549, 1987484396, 3402253711, 2189597983,
      3385409673, 2105378810, 4210693615, 1499065266, 1195886990, 4042263547,
      2913856577, 3570689971, 2728590687, 2947541573, 2627518243, 2762274643,
      1920112356, 3233831835, 3082273397, 4261223649, 2475929149, 640051788,
      909531756, 1061110142, 4160160501, 3435941763, 875846760, 2779116625,
      3857003729, 4059105529, 1903268834, 3638064043, 825316194, 353713962,
      67374088, 3351728789, 589522246, 3284360861, 404236336, 2526454071,
      84217610, 2593830191, 117901582, 303183396, 2155911963, 3806477791,
      3958056653, 656894286, 2998062463, 1970642922, 151591698, 2206440989,
      741110872, 437923380, 454765878, 1852748508, 1515908788, 2694904667,
      1381168804, 993742198, 3604373943, 3014905469, 690584402, 3823320797,
      791638366, 2223281939, 1398011302, 3520161977, 0, 3991743681, 538992704,
      4244381667, 2981218425, 1532751286, 1785380564, 3419096717, 3200178535,
      960056178, 1246420628, 1280103576, 1482221744, 3486468741, 3503319995,
      4025428677, 2863326543, 4227536621, 1128514950, 1296947098, 859002214,
      2240123921, 1162203018, 4193849577, 33687044, 2139062782, 1347481760,
      1010582648, 2678045221, 2829640523, 1364325282, 2745433693, 1077985408,
      2408548869, 2459086143, 2644360225, 943212656, 4126475505, 3166494563,
      3065430391, 3671750063, 555836226, 269496352, 4294908645, 4092792573,
      3537006015, 3452783745, 202118168, 320025894, 3974901699, 1600119230,
      2543297077, 1145359496, 387397934, 3301201811, 2812801621, 2122220284,
      1027426170, 1684319432, 1566435258, 421079858, 1936954854, 1616945344,
      2172753945, 1330631070, 3705438115, 572679748, 707427924, 2425400123,
      2290647819, 1179044492, 4008585671, 3099120491, 336870440, 3739122087,
      1583276732, 185277718, 3688593069, 3772791771, 842159716, 976899700,
      168435220, 1229577106, 101059084, 606366792, 1549591736, 3267517855,
      3553849021, 2897014595, 1650632388, 2442242105, 2509612081, 3840161747,
      2038008818, 3890688725, 3368567691, 926374254, 1835907034, 2374863873,
      3587531953, 1313788572, 2846482505, 1819063512, 1448540844, 4109633523,
      3941213647, 1701162954, 2054852340, 2930698567, 134748176, 3132806511,
      2021165296, 623210314, 774795868, 471606328, 2795958615, 3031746419,
      3334885783, 3907527627, 3722280097, 1953799400, 522133822, 1263263126,
      3183336545, 2341176845, 2324333839, 1886425312, 1044267644, 3048588401,
      1718004428, 1212733584, 50529542, 4143317495, 235803164, 1633788866,
      892690282, 1465383342, 3115962473, 2256965911, 3250673817, 488449850,
      2661202215, 3789633753, 4177007595, 2560144171, 286339874, 1768537042,
      3654906025, 2391705863, 2492770099, 2610673197, 505291324, 2273808917,
      3924369609, 3469625735, 1431699370, 673740880, 3755965093, 2358021891,
      2711746649, 2307489801, 218961690, 3217021541, 3873845719, 1111672452,
      1751693520, 1094828930, 2576986153, 757954394, 252645662, 2964376443,
      1414855848, 3149649517, 370555436,
    ],
    q = [
      1374988112, 2118214995, 437757123, 975658646, 1001089995, 530400753,
      2902087851, 1273168787, 540080725, 2910219766, 2295101073, 4110568485,
      1340463100, 3307916247, 641025152, 3043140495, 3736164937, 632953703,
      1172967064, 1576976609, 3274667266, 2169303058, 2370213795, 1809054150,
      59727847, 361929877, 3211623147, 2505202138, 3569255213, 1484005843,
      1239443753, 2395588676, 1975683434, 4102977912, 2572697195, 666464733,
      3202437046, 4035489047, 3374361702, 2110667444, 1675577880, 3843699074,
      2538681184, 1649639237, 2976151520, 3144396420, 4269907996, 4178062228,
      1883793496, 2403728665, 2497604743, 1383856311, 2876494627, 1917518562,
      3810496343, 1716890410, 3001755655, 800440835, 2261089178, 3543599269,
      807962610, 599762354, 33778362, 3977675356, 2328828971, 2809771154,
      4077384432, 1315562145, 1708848333, 101039829, 3509871135, 3299278474,
      875451293, 2733856160, 92987698, 2767645557, 193195065, 1080094634,
      1584504582, 3178106961, 1042385657, 2531067453, 3711829422, 1306967366,
      2438237621, 1908694277, 67556463, 1615861247, 429456164, 3602770327,
      2302690252, 1742315127, 2968011453, 126454664, 3877198648, 2043211483,
      2709260871, 2084704233, 4169408201, 0, 159417987, 841739592, 504459436,
      1817866830, 4245618683, 260388950, 1034867998, 908933415, 168810852,
      1750902305, 2606453969, 607530554, 202008497, 2472011535, 3035535058,
      463180190, 2160117071, 1641816226, 1517767529, 470948374, 3801332234,
      3231722213, 1008918595, 303765277, 235474187, 4069246893, 766945465,
      337553864, 1475418501, 2943682380, 4003061179, 2743034109, 4144047775,
      1551037884, 1147550661, 1543208500, 2336434550, 3408119516, 3069049960,
      3102011747, 3610369226, 1113818384, 328671808, 2227573024, 2236228733,
      3535486456, 2935566865, 3341394285, 496906059, 3702665459, 226906860,
      2009195472, 733156972, 2842737049, 294930682, 1206477858, 2835123396,
      2700099354, 1451044056, 573804783, 2269728455, 3644379585, 2362090238,
      2564033334, 2801107407, 2776292904, 3669462566, 1068351396, 742039012,
      1350078989, 1784663195, 1417561698, 4136440770, 2430122216, 775550814,
      2193862645, 2673705150, 1775276924, 1876241833, 3475313331, 3366754619,
      270040487, 3902563182, 3678124923, 3441850377, 1851332852, 3969562369,
      2203032232, 3868552805, 2868897406, 566021896, 4011190502, 3135740889,
      1248802510, 3936291284, 699432150, 832877231, 708780849, 3332740144,
      899835584, 1951317047, 4236429990, 3767586992, 866637845, 4043610186,
      1106041591, 2144161806, 395441711, 1984812685, 1139781709, 3433712980,
      3835036895, 2664543715, 1282050075, 3240894392, 1181045119, 2640243204,
      25965917, 4203181171, 4211818798, 3009879386, 2463879762, 3910161971,
      1842759443, 2597806476, 933301370, 1509430414, 3943906441, 3467192302,
      3076639029, 3776767469, 2051518780, 2631065433, 1441952575, 404016761,
      1942435775, 1408749034, 1610459739, 3745345300, 2017778566, 3400528769,
      3110650942, 941896748, 3265478751, 371049330, 3168937228, 675039627,
      4279080257, 967311729, 135050206, 3635733660, 1683407248, 2076935265,
      3576870512, 1215061108, 3501741890,
    ],
    r = [
      1347548327, 1400783205, 3273267108, 2520393566, 3409685355, 4045380933,
      2880240216, 2471224067, 1428173050, 4138563181, 2441661558, 636813900,
      4233094615, 3620022987, 2149987652, 2411029155, 1239331162, 1730525723,
      2554718734, 3781033664, 46346101, 310463728, 2743944855, 3328955385,
      3875770207, 2501218972, 3955191162, 3667219033, 768917123, 3545789473,
      692707433, 1150208456, 1786102409, 2029293177, 1805211710, 3710368113,
      3065962831, 401639597, 1724457132, 3028143674, 409198410, 2196052529,
      1620529459, 1164071807, 3769721975, 2226875310, 486441376, 2499348523,
      1483753576, 428819965, 2274680428, 3075636216, 598438867, 3799141122,
      1474502543, 711349675, 129166120, 53458370, 2592523643, 2782082824,
      4063242375, 2988687269, 3120694122, 1559041666, 730517276, 2460449204,
      4042459122, 2706270690, 3446004468, 3573941694, 533804130, 2328143614,
      2637442643, 2695033685, 839224033, 1973745387, 957055980, 2856345839,
      106852767, 1371368976, 4181598602, 1033297158, 2933734917, 1179510461,
      3046200461, 91341917, 1862534868, 4284502037, 605657339, 2547432937,
      3431546947, 2003294622, 3182487618, 2282195339, 954669403, 3682191598,
      1201765386, 3917234703, 3388507166, 0, 2198438022, 1211247597, 2887651696,
      1315723890, 4227665663, 1443857720, 507358933, 657861945, 1678381017,
      560487590, 3516619604, 975451694, 2970356327, 261314535, 3535072918,
      2652609425, 1333838021, 2724322336, 1767536459, 370938394, 182621114,
      3854606378, 1128014560, 487725847, 185469197, 2918353863, 3106780840,
      3356761769, 2237133081, 1286567175, 3152976349, 4255350624, 2683765030,
      3160175349, 3309594171, 878443390, 1988838185, 3704300486, 1756818940,
      1673061617, 3403100636, 272786309, 1075025698, 545572369, 2105887268,
      4174560061, 296679730, 1841768865, 1260232239, 4091327024, 3960309330,
      3497509347, 1814803222, 2578018489, 4195456072, 575138148, 3299409036,
      446754879, 3629546796, 4011996048, 3347532110, 3252238545, 4270639778,
      915985419, 3483825537, 681933534, 651868046, 2755636671, 3828103837,
      223377554, 2607439820, 1649704518, 3270937875, 3901806776, 1580087799,
      4118987695, 3198115200, 2087309459, 2842678573, 3016697106, 1003007129,
      2802849917, 1860738147, 2077965243, 164439672, 4100872472, 32283319,
      2827177882, 1709610350, 2125135846, 136428751, 3874428392, 3652904859,
      3460984630, 3572145929, 3593056380, 2939266226, 824852259, 818324884,
      3224740454, 930369212, 2801566410, 2967507152, 355706840, 1257309336,
      4148292826, 243256656, 790073846, 2373340630, 1296297904, 1422699085,
      3756299780, 3818836405, 457992840, 3099667487, 2135319889, 77422314,
      1560382517, 1945798516, 788204353, 1521706781, 1385356242, 870912086,
      325965383, 2358957921, 2050466060, 2388260884, 2313884476, 4006521127,
      901210569, 3990953189, 1014646705, 1503449823, 1062597235, 2031621326,
      3212035895, 3931371469, 1533017514, 350174575, 2256028891, 2177544179,
      1052338372, 741876788, 1606591296, 1914052035, 213705253, 2334669897,
      1107234197, 1899603969, 3725069491, 2631447780, 2422494913, 1635502980,
      1893020342, 1950903388, 1120974935,
    ],
    s = [
      2807058932, 1699970625, 2764249623, 1586903591, 1808481195, 1173430173,
      1487645946, 59984867, 4199882800, 1844882806, 1989249228, 1277555970,
      3623636965, 3419915562, 1149249077, 2744104290, 1514790577, 459744698,
      244860394, 3235995134, 1963115311, 4027744588, 2544078150, 4190530515,
      1608975247, 2627016082, 2062270317, 1507497298, 2200818878, 567498868,
      1764313568, 3359936201, 2305455554, 2037970062, 1047239e3, 1910319033,
      1337376481, 2904027272, 2892417312, 984907214, 1243112415, 830661914,
      861968209, 2135253587, 2011214180, 2927934315, 2686254721, 731183368,
      1750626376, 4246310725, 1820824798, 4172763771, 3542330227, 48394827,
      2404901663, 2871682645, 671593195, 3254988725, 2073724613, 145085239,
      2280796200, 2779915199, 1790575107, 2187128086, 472615631, 3029510009,
      4075877127, 3802222185, 4107101658, 3201631749, 1646252340, 4270507174,
      1402811438, 1436590835, 3778151818, 3950355702, 3963161475, 4020912224,
      2667994737, 273792366, 2331590177, 104699613, 95345982, 3175501286,
      2377486676, 1560637892, 3564045318, 369057872, 4213447064, 3919042237,
      1137477952, 2658625497, 1119727848, 2340947849, 1530455833, 4007360968,
      172466556, 266959938, 516552836, 0, 2256734592, 3980931627, 1890328081,
      1917742170, 4294704398, 945164165, 3575528878, 958871085, 3647212047,
      2787207260, 1423022939, 775562294, 1739656202, 3876557655, 2530391278,
      2443058075, 3310321856, 547512796, 1265195639, 437656594, 3121275539,
      719700128, 3762502690, 387781147, 218828297, 3350065803, 2830708150,
      2848461854, 428169201, 122466165, 3720081049, 1627235199, 648017665,
      4122762354, 1002783846, 2117360635, 695634755, 3336358691, 4234721005,
      4049844452, 3704280881, 2232435299, 574624663, 287343814, 612205898,
      1039717051, 840019705, 2708326185, 793451934, 821288114, 1391201670,
      3822090177, 376187827, 3113855344, 1224348052, 1679968233, 2361698556,
      1058709744, 752375421, 2431590963, 1321699145, 3519142200, 2734591178,
      188127444, 2177869557, 3727205754, 2384911031, 3215212461, 2648976442,
      2450346104, 3432737375, 1180849278, 331544205, 3102249176, 4150144569,
      2952102595, 2159976285, 2474404304, 766078933, 313773861, 2570832044,
      2108100632, 1668212892, 3145456443, 2013908262, 418672217, 3070356634,
      2594734927, 1852171925, 3867060991, 3473416636, 3907448597, 2614737639,
      919489135, 164948639, 2094410160, 2997825956, 590424639, 2486224549,
      1723872674, 3157750862, 3399941250, 3501252752, 3625268135, 2555048196,
      3673637356, 1343127501, 4130281361, 3599595085, 2957853679, 1297403050,
      81781910, 3051593425, 2283490410, 532201772, 1367295589, 3926170974,
      895287692, 1953757831, 1093597963, 492483431, 3528626907, 1446242576,
      1192455638, 1636604631, 209336225, 344873464, 1015671571, 669961897,
      3375740769, 3857572124, 2973530695, 3747192018, 1933530610, 3464042516,
      935293895, 3454686199, 2858115069, 1863638845, 3683022916, 4085369519,
      3292445032, 875313188, 1080017571, 3279033885, 621591778, 1233856572,
      2504130317, 24197544, 3017672716, 3835484340, 3247465558, 2220981195,
      3060847922, 1551124588, 1463996600,
    ],
    t = [
      4104605777, 1097159550, 396673818, 660510266, 2875968315, 2638606623,
      4200115116, 3808662347, 821712160, 1986918061, 3430322568, 38544885,
      3856137295, 718002117, 893681702, 1654886325, 2975484382, 3122358053,
      3926825029, 4274053469, 796197571, 1290801793, 1184342925, 3556361835,
      2405426947, 2459735317, 1836772287, 1381620373, 3196267988, 1948373848,
      3764988233, 3385345166, 3263785589, 2390325492, 1480485785, 3111247143,
      3780097726, 2293045232, 548169417, 3459953789, 3746175075, 439452389,
      1362321559, 1400849762, 1685577905, 1806599355, 2174754046, 137073913,
      1214797936, 1174215055, 3731654548, 2079897426, 1943217067, 1258480242,
      529487843, 1437280870, 3945269170, 3049390895, 3313212038, 923313619,
      679998e3, 3215307299, 57326082, 377642221, 3474729866, 2041877159,
      133361907, 1776460110, 3673476453, 96392454, 878845905, 2801699524,
      777231668, 4082475170, 2330014213, 4142626212, 2213296395, 1626319424,
      1906247262, 1846563261, 562755902, 3708173718, 1040559837, 3871163981,
      1418573201, 3294430577, 114585348, 1343618912, 2566595609, 3186202582,
      1078185097, 3651041127, 3896688048, 2307622919, 425408743, 3371096953,
      2081048481, 1108339068, 2216610296, 0, 2156299017, 736970802, 292596766,
      1517440620, 251657213, 2235061775, 2933202493, 758720310, 265905162,
      1554391400, 1532285339, 908999204, 174567692, 1474760595, 4002861748,
      2610011675, 3234156416, 3693126241, 2001430874, 303699484, 2478443234,
      2687165888, 585122620, 454499602, 151849742, 2345119218, 3064510765,
      514443284, 4044981591, 1963412655, 2581445614, 2137062819, 19308535,
      1928707164, 1715193156, 4219352155, 1126790795, 600235211, 3992742070,
      3841024952, 836553431, 1669664834, 2535604243, 3323011204, 1243905413,
      3141400786, 4180808110, 698445255, 2653899549, 2989552604, 2253581325,
      3252932727, 3004591147, 1891211689, 2487810577, 3915653703, 4237083816,
      4030667424, 2100090966, 865136418, 1229899655, 953270745, 3399679628,
      3557504664, 4118925222, 2061379749, 3079546586, 2915017791, 983426092,
      2022837584, 1607244650, 2118541908, 2366882550, 3635996816, 972512814,
      3283088770, 1568718495, 3499326569, 3576539503, 621982671, 2895723464,
      410887952, 2623762152, 1002142683, 645401037, 1494807662, 2595684844,
      1335535747, 2507040230, 4293295786, 3167684641, 367585007, 3885750714,
      1865862730, 2668221674, 2960971305, 2763173681, 1059270954, 2777952454,
      2724642869, 1320957812, 2194319100, 2429595872, 2815956275, 77089521,
      3973773121, 3444575871, 2448830231, 1305906550, 4021308739, 2857194700,
      2516901860, 3518358430, 1787304780, 740276417, 1699839814, 1592394909,
      2352307457, 2272556026, 188821243, 1729977011, 3687994002, 274084841,
      3594982253, 3613494426, 2701949495, 4162096729, 322734571, 2837966542,
      1640576439, 484830689, 1202797690, 3537852828, 4067639125, 349075736,
      3342319475, 4157467219, 4255800159, 1030690015, 1155237496, 2951971274,
      1757691577, 607398968, 2738905026, 499347990, 3794078908, 1011452712,
      227885567, 2818666809, 213114376, 3034881240, 1455525988, 3414450555,
      850817237, 1817998408, 3092726480,
    ],
    u = [
      0, 235474187, 470948374, 303765277, 941896748, 908933415, 607530554,
      708780849, 1883793496, 2118214995, 1817866830, 1649639237, 1215061108,
      1181045119, 1417561698, 1517767529, 3767586992, 4003061179, 4236429990,
      4069246893, 3635733660, 3602770327, 3299278474, 3400528769, 2430122216,
      2664543715, 2362090238, 2193862645, 2835123396, 2801107407, 3035535058,
      3135740889, 3678124923, 3576870512, 3341394285, 3374361702, 3810496343,
      3977675356, 4279080257, 4043610186, 2876494627, 2776292904, 3076639029,
      3110650942, 2472011535, 2640243204, 2403728665, 2169303058, 1001089995,
      899835584, 666464733, 699432150, 59727847, 226906860, 530400753,
      294930682, 1273168787, 1172967064, 1475418501, 1509430414, 1942435775,
      2110667444, 1876241833, 1641816226, 2910219766, 2743034109, 2976151520,
      3211623147, 2505202138, 2606453969, 2302690252, 2269728455, 3711829422,
      3543599269, 3240894392, 3475313331, 3843699074, 3943906441, 4178062228,
      4144047775, 1306967366, 1139781709, 1374988112, 1610459739, 1975683434,
      2076935265, 1775276924, 1742315127, 1034867998, 866637845, 566021896,
      800440835, 92987698, 193195065, 429456164, 395441711, 1984812685,
      2017778566, 1784663195, 1683407248, 1315562145, 1080094634, 1383856311,
      1551037884, 101039829, 135050206, 437757123, 337553864, 1042385657,
      807962610, 573804783, 742039012, 2531067453, 2564033334, 2328828971,
      2227573024, 2935566865, 2700099354, 3001755655, 3168937228, 3868552805,
      3902563182, 4203181171, 4102977912, 3736164937, 3501741890, 3265478751,
      3433712980, 1106041591, 1340463100, 1576976609, 1408749034, 2043211483,
      2009195472, 1708848333, 1809054150, 832877231, 1068351396, 766945465,
      599762354, 159417987, 126454664, 361929877, 463180190, 2709260871,
      2943682380, 3178106961, 3009879386, 2572697195, 2538681184, 2236228733,
      2336434550, 3509871135, 3745345300, 3441850377, 3274667266, 3910161971,
      3877198648, 4110568485, 4211818798, 2597806476, 2497604743, 2261089178,
      2295101073, 2733856160, 2902087851, 3202437046, 2968011453, 3936291284,
      3835036895, 4136440770, 4169408201, 3535486456, 3702665459, 3467192302,
      3231722213, 2051518780, 1951317047, 1716890410, 1750902305, 1113818384,
      1282050075, 1584504582, 1350078989, 168810852, 67556463, 371049330,
      404016761, 841739592, 1008918595, 775550814, 540080725, 3969562369,
      3801332234, 4035489047, 4269907996, 3569255213, 3669462566, 3366754619,
      3332740144, 2631065433, 2463879762, 2160117071, 2395588676, 2767645557,
      2868897406, 3102011747, 3069049960, 202008497, 33778362, 270040487,
      504459436, 875451293, 975658646, 675039627, 641025152, 2084704233,
      1917518562, 1615861247, 1851332852, 1147550661, 1248802510, 1484005843,
      1451044056, 933301370, 967311729, 733156972, 632953703, 260388950,
      25965917, 328671808, 496906059, 1206477858, 1239443753, 1543208500,
      1441952575, 2144161806, 1908694277, 1675577880, 1842759443, 3610369226,
      3644379585, 3408119516, 3307916247, 4011190502, 3776767469, 4077384432,
      4245618683, 2809771154, 2842737049, 3144396420, 3043140495, 2673705150,
      2438237621, 2203032232, 2370213795,
    ],
    v = [
      0, 185469197, 370938394, 487725847, 741876788, 657861945, 975451694,
      824852259, 1483753576, 1400783205, 1315723890, 1164071807, 1950903388,
      2135319889, 1649704518, 1767536459, 2967507152, 3152976349, 2801566410,
      2918353863, 2631447780, 2547432937, 2328143614, 2177544179, 3901806776,
      3818836405, 4270639778, 4118987695, 3299409036, 3483825537, 3535072918,
      3652904859, 2077965243, 1893020342, 1841768865, 1724457132, 1474502543,
      1559041666, 1107234197, 1257309336, 598438867, 681933534, 901210569,
      1052338372, 261314535, 77422314, 428819965, 310463728, 3409685355,
      3224740454, 3710368113, 3593056380, 3875770207, 3960309330, 4045380933,
      4195456072, 2471224067, 2554718734, 2237133081, 2388260884, 3212035895,
      3028143674, 2842678573, 2724322336, 4138563181, 4255350624, 3769721975,
      3955191162, 3667219033, 3516619604, 3431546947, 3347532110, 2933734917,
      2782082824, 3099667487, 3016697106, 2196052529, 2313884476, 2499348523,
      2683765030, 1179510461, 1296297904, 1347548327, 1533017514, 1786102409,
      1635502980, 2087309459, 2003294622, 507358933, 355706840, 136428751,
      53458370, 839224033, 957055980, 605657339, 790073846, 2373340630,
      2256028891, 2607439820, 2422494913, 2706270690, 2856345839, 3075636216,
      3160175349, 3573941694, 3725069491, 3273267108, 3356761769, 4181598602,
      4063242375, 4011996048, 3828103837, 1033297158, 915985419, 730517276,
      545572369, 296679730, 446754879, 129166120, 213705253, 1709610350,
      1860738147, 1945798516, 2029293177, 1239331162, 1120974935, 1606591296,
      1422699085, 4148292826, 4233094615, 3781033664, 3931371469, 3682191598,
      3497509347, 3446004468, 3328955385, 2939266226, 2755636671, 3106780840,
      2988687269, 2198438022, 2282195339, 2501218972, 2652609425, 1201765386,
      1286567175, 1371368976, 1521706781, 1805211710, 1620529459, 2105887268,
      1988838185, 533804130, 350174575, 164439672, 46346101, 870912086,
      954669403, 636813900, 788204353, 2358957921, 2274680428, 2592523643,
      2441661558, 2695033685, 2880240216, 3065962831, 3182487618, 3572145929,
      3756299780, 3270937875, 3388507166, 4174560061, 4091327024, 4006521127,
      3854606378, 1014646705, 930369212, 711349675, 560487590, 272786309,
      457992840, 106852767, 223377554, 1678381017, 1862534868, 1914052035,
      2031621326, 1211247597, 1128014560, 1580087799, 1428173050, 32283319,
      182621114, 401639597, 486441376, 768917123, 651868046, 1003007129,
      818324884, 1503449823, 1385356242, 1333838021, 1150208456, 1973745387,
      2125135846, 1673061617, 1756818940, 2970356327, 3120694122, 2802849917,
      2887651696, 2637442643, 2520393566, 2334669897, 2149987652, 3917234703,
      3799141122, 4284502037, 4100872472, 3309594171, 3460984630, 3545789473,
      3629546796, 2050466060, 1899603969, 1814803222, 1730525723, 1443857720,
      1560382517, 1075025698, 1260232239, 575138148, 692707433, 878443390,
      1062597235, 243256656, 91341917, 409198410, 325965383, 3403100636,
      3252238545, 3704300486, 3620022987, 3874428392, 3990953189, 4042459122,
      4227665663, 2460449204, 2578018489, 2226875310, 2411029155, 3198115200,
      3046200461, 2827177882, 2743944855,
    ],
    w = [
      0, 218828297, 437656594, 387781147, 875313188, 958871085, 775562294,
      590424639, 1750626376, 1699970625, 1917742170, 2135253587, 1551124588,
      1367295589, 1180849278, 1265195639, 3501252752, 3720081049, 3399941250,
      3350065803, 3835484340, 3919042237, 4270507174, 4085369519, 3102249176,
      3051593425, 2734591178, 2952102595, 2361698556, 2177869557, 2530391278,
      2614737639, 3145456443, 3060847922, 2708326185, 2892417312, 2404901663,
      2187128086, 2504130317, 2555048196, 3542330227, 3727205754, 3375740769,
      3292445032, 3876557655, 3926170974, 4246310725, 4027744588, 1808481195,
      1723872674, 1910319033, 2094410160, 1608975247, 1391201670, 1173430173,
      1224348052, 59984867, 244860394, 428169201, 344873464, 935293895,
      984907214, 766078933, 547512796, 1844882806, 1627235199, 2011214180,
      2062270317, 1507497298, 1423022939, 1137477952, 1321699145, 95345982,
      145085239, 532201772, 313773861, 830661914, 1015671571, 731183368,
      648017665, 3175501286, 2957853679, 2807058932, 2858115069, 2305455554,
      2220981195, 2474404304, 2658625497, 3575528878, 3625268135, 3473416636,
      3254988725, 3778151818, 3963161475, 4213447064, 4130281361, 3599595085,
      3683022916, 3432737375, 3247465558, 3802222185, 4020912224, 4172763771,
      4122762354, 3201631749, 3017672716, 2764249623, 2848461854, 2331590177,
      2280796200, 2431590963, 2648976442, 104699613, 188127444, 472615631,
      287343814, 840019705, 1058709744, 671593195, 621591778, 1852171925,
      1668212892, 1953757831, 2037970062, 1514790577, 1463996600, 1080017571,
      1297403050, 3673637356, 3623636965, 3235995134, 3454686199, 4007360968,
      3822090177, 4107101658, 4190530515, 2997825956, 3215212461, 2830708150,
      2779915199, 2256734592, 2340947849, 2627016082, 2443058075, 172466556,
      122466165, 273792366, 492483431, 1047239e3, 861968209, 612205898,
      695634755, 1646252340, 1863638845, 2013908262, 1963115311, 1446242576,
      1530455833, 1277555970, 1093597963, 1636604631, 1820824798, 2073724613,
      1989249228, 1436590835, 1487645946, 1337376481, 1119727848, 164948639,
      81781910, 331544205, 516552836, 1039717051, 821288114, 669961897,
      719700128, 2973530695, 3157750862, 2871682645, 2787207260, 2232435299,
      2283490410, 2667994737, 2450346104, 3647212047, 3564045318, 3279033885,
      3464042516, 3980931627, 3762502690, 4150144569, 4199882800, 3070356634,
      3121275539, 2904027272, 2686254721, 2200818878, 2384911031, 2570832044,
      2486224549, 3747192018, 3528626907, 3310321856, 3359936201, 3950355702,
      3867060991, 4049844452, 4234721005, 1739656202, 1790575107, 2108100632,
      1890328081, 1402811438, 1586903591, 1233856572, 1149249077, 266959938,
      48394827, 369057872, 418672217, 1002783846, 919489135, 567498868,
      752375421, 209336225, 24197544, 376187827, 459744698, 945164165,
      895287692, 574624663, 793451934, 1679968233, 1764313568, 2117360635,
      1933530610, 1343127501, 1560637892, 1243112415, 1192455638, 3704280881,
      3519142200, 3336358691, 3419915562, 3907448597, 3857572124, 4075877127,
      4294704398, 3029510009, 3113855344, 2927934315, 2744104290, 2159976285,
      2377486676, 2594734927, 2544078150,
    ],
    x = [
      0, 151849742, 303699484, 454499602, 607398968, 758720310, 908999204,
      1059270954, 1214797936, 1097159550, 1517440620, 1400849762, 1817998408,
      1699839814, 2118541908, 2001430874, 2429595872, 2581445614, 2194319100,
      2345119218, 3034881240, 3186202582, 2801699524, 2951971274, 3635996816,
      3518358430, 3399679628, 3283088770, 4237083816, 4118925222, 4002861748,
      3885750714, 1002142683, 850817237, 698445255, 548169417, 529487843,
      377642221, 227885567, 77089521, 1943217067, 2061379749, 1640576439,
      1757691577, 1474760595, 1592394909, 1174215055, 1290801793, 2875968315,
      2724642869, 3111247143, 2960971305, 2405426947, 2253581325, 2638606623,
      2487810577, 3808662347, 3926825029, 4044981591, 4162096729, 3342319475,
      3459953789, 3576539503, 3693126241, 1986918061, 2137062819, 1685577905,
      1836772287, 1381620373, 1532285339, 1078185097, 1229899655, 1040559837,
      923313619, 740276417, 621982671, 439452389, 322734571, 137073913,
      19308535, 3871163981, 4021308739, 4104605777, 4255800159, 3263785589,
      3414450555, 3499326569, 3651041127, 2933202493, 2815956275, 3167684641,
      3049390895, 2330014213, 2213296395, 2566595609, 2448830231, 1305906550,
      1155237496, 1607244650, 1455525988, 1776460110, 1626319424, 2079897426,
      1928707164, 96392454, 213114376, 396673818, 514443284, 562755902,
      679998e3, 865136418, 983426092, 3708173718, 3557504664, 3474729866,
      3323011204, 4180808110, 4030667424, 3945269170, 3794078908, 2507040230,
      2623762152, 2272556026, 2390325492, 2975484382, 3092726480, 2738905026,
      2857194700, 3973773121, 3856137295, 4274053469, 4157467219, 3371096953,
      3252932727, 3673476453, 3556361835, 2763173681, 2915017791, 3064510765,
      3215307299, 2156299017, 2307622919, 2459735317, 2610011675, 2081048481,
      1963412655, 1846563261, 1729977011, 1480485785, 1362321559, 1243905413,
      1126790795, 878845905, 1030690015, 645401037, 796197571, 274084841,
      425408743, 38544885, 188821243, 3613494426, 3731654548, 3313212038,
      3430322568, 4082475170, 4200115116, 3780097726, 3896688048, 2668221674,
      2516901860, 2366882550, 2216610296, 3141400786, 2989552604, 2837966542,
      2687165888, 1202797690, 1320957812, 1437280870, 1554391400, 1669664834,
      1787304780, 1906247262, 2022837584, 265905162, 114585348, 499347990,
      349075736, 736970802, 585122620, 972512814, 821712160, 2595684844,
      2478443234, 2293045232, 2174754046, 3196267988, 3079546586, 2895723464,
      2777952454, 3537852828, 3687994002, 3234156416, 3385345166, 4142626212,
      4293295786, 3841024952, 3992742070, 174567692, 57326082, 410887952,
      292596766, 777231668, 660510266, 1011452712, 893681702, 1108339068,
      1258480242, 1343618912, 1494807662, 1715193156, 1865862730, 1948373848,
      2100090966, 2701949495, 2818666809, 3004591147, 3122358053, 2235061775,
      2352307457, 2535604243, 2653899549, 3915653703, 3764988233, 4219352155,
      4067639125, 3444575871, 3294430577, 3746175075, 3594982253, 836553431,
      953270745, 600235211, 718002117, 367585007, 484830689, 133361907,
      251657213, 2041877159, 1891211689, 1806599355, 1654886325, 1568718495,
      1418573201, 1335535747, 1184342925,
    ],
    z = function (a) {
      if (!(this instanceof z))
        throw Error("AES must be instanitated with `new`");
      Object.defineProperty(this, "key", {
        value: d(a, !0),
      }),
        this._prepare();
    };
  (z.prototype._prepare = function () {
    var a = i[this.key.length];
    if (a == null)
      throw new Error("invalid key size (must be 16, 24 or 32 bytes)");
    (this._Ke = []), (this._Kd = []);
    for (var b = 0; b <= a; b++)
      this._Ke.push([0, 0, 0, 0]), this._Kd.push([0, 0, 0, 0]);
    var c = (a + 1) * 4,
      d = this.key.length / 4,
      e = y(this.key),
      f;
    for (var b = 0; b < d; b++)
      (f = b >> 2),
        (this._Ke[f][b % 4] = e[b]),
        (this._Kd[a - f][b % 4] = e[b]);
    var g = 0,
      h = d,
      l;
    while (h < c) {
      (l = e[d - 1]),
        (e[0] ^=
          (k[(l >> 16) & 255] << 24) ^
          (k[(l >> 8) & 255] << 16) ^
          (k[l & 255] << 8) ^
          k[(l >> 24) & 255] ^
          (j[g] << 24)),
        (g += 1);
      if (d != 8) for (var b = 1; b < d; b++) e[b] ^= e[b - 1];
      else {
        for (var b = 1; b < d / 2; b++) e[b] ^= e[b - 1];
        (l = e[d / 2 - 1]),
          (e[d / 2] ^=
            k[l & 255] ^
            (k[(l >> 8) & 255] << 8) ^
            (k[(l >> 16) & 255] << 16) ^
            (k[(l >> 24) & 255] << 24));
        for (var b = d / 2 + 1; b < d; b++) e[b] ^= e[b - 1];
      }
      var b = 0,
        m,
        n;
      while (b < d && h < c)
        (m = h >> 2),
          (n = h % 4),
          (this._Ke[m][n] = e[b]),
          (this._Kd[a - m][n] = e[b++]),
          h++;
    }
    for (var m = 1; m < a; m++)
      for (var n = 0; n < 4; n++)
        (l = this._Kd[m][n]),
          (this._Kd[m][n] =
            u[(l >> 24) & 255] ^
            v[(l >> 16) & 255] ^
            w[(l >> 8) & 255] ^
            x[l & 255]);
  }),
    (z.prototype.encrypt = function (a) {
      if (a.length != 16)
        throw new Error("invalid plaintext size (must be 16 bytes)");
      var b = this._Ke.length - 1,
        c = [0, 0, 0, 0],
        d = y(a);
      for (var f = 0; f < 4; f++) d[f] ^= this._Ke[0][f];
      for (var g = 1; g < b; g++) {
        for (var f = 0; f < 4; f++)
          c[f] =
            m[(d[f] >> 24) & 255] ^
            n[(d[(f + 1) % 4] >> 16) & 255] ^
            o[(d[(f + 2) % 4] >> 8) & 255] ^
            p[d[(f + 3) % 4] & 255] ^
            this._Ke[g][f];
        d = c.slice();
      }
      var h = e(16),
        i;
      for (var f = 0; f < 4; f++)
        (i = this._Ke[b][f]),
          (h[4 * f] = (k[(d[f] >> 24) & 255] ^ (i >> 24)) & 255),
          (h[4 * f + 1] = (k[(d[(f + 1) % 4] >> 16) & 255] ^ (i >> 16)) & 255),
          (h[4 * f + 2] = (k[(d[(f + 2) % 4] >> 8) & 255] ^ (i >> 8)) & 255),
          (h[4 * f + 3] = (k[d[(f + 3) % 4] & 255] ^ i) & 255);
      return h;
    }),
    (z.prototype.decrypt = function (a) {
      if (a.length != 16)
        throw new Error("invalid ciphertext size (must be 16 bytes)");
      var b = this._Kd.length - 1,
        c = [0, 0, 0, 0],
        d = y(a);
      for (var f = 0; f < 4; f++) d[f] ^= this._Kd[0][f];
      for (var g = 1; g < b; g++) {
        for (var f = 0; f < 4; f++)
          c[f] =
            q[(d[f] >> 24) & 255] ^
            r[(d[(f + 3) % 4] >> 16) & 255] ^
            s[(d[(f + 2) % 4] >> 8) & 255] ^
            t[d[(f + 1) % 4] & 255] ^
            this._Kd[g][f];
        d = c.slice();
      }
      var h = e(16),
        i;
      for (var f = 0; f < 4; f++)
        (i = this._Kd[b][f]),
          (h[4 * f] = (l[(d[f] >> 24) & 255] ^ (i >> 24)) & 255),
          (h[4 * f + 1] = (l[(d[(f + 3) % 4] >> 16) & 255] ^ (i >> 16)) & 255),
          (h[4 * f + 2] = (l[(d[(f + 2) % 4] >> 8) & 255] ^ (i >> 8)) & 255),
          (h[4 * f + 3] = (l[d[(f + 1) % 4] & 255] ^ i) & 255);
      return h;
    });
  var A = function (a) {
    if (!(this instanceof A))
      throw Error("AES must be instanitated with `new`");
    (this.description = "Electronic Code Block"),
      (this.name = "ecb"),
      (this._aes = new z(a));
  };
  (A.prototype.encrypt = function (a) {
    a = d(a);
    if (a.length % 16 !== 0)
      throw new Error("invalid plaintext size (must be multiple of 16 bytes)");
    var b = e(a.length),
      c = e(16);
    for (var g = 0; g < a.length; g += 16)
      f(a, c, 0, g, g + 16), (c = this._aes.encrypt(c)), f(c, b, g);
    return b;
  }),
    (A.prototype.decrypt = function (a) {
      a = d(a);
      if (a.length % 16 !== 0)
        throw new Error(
          "invalid ciphertext size (must be multiple of 16 bytes)"
        );
      var b = e(a.length),
        c = e(16);
      for (var g = 0; g < a.length; g += 16)
        f(a, c, 0, g, g + 16), (c = this._aes.decrypt(c)), f(c, b, g);
      return b;
    });
  var B = function (a, b) {
    if (!(this instanceof B))
      throw Error("AES must be instanitated with `new`");
    (this.description = "Cipher Block Chaining"), (this.name = "cbc");
    if (!b) b = e(16);
    else if (b.length != 16)
      throw new Error("invalid initialation vector size (must be 16 bytes)");
    (this._lastCipherblock = d(b, !0)), (this._aes = new z(a));
  };
  (B.prototype.encrypt = function (a) {
    a = d(a);
    if (a.length % 16 !== 0)
      throw new Error("invalid plaintext size (must be multiple of 16 bytes)");
    var b = e(a.length),
      c = e(16);
    for (var g = 0; g < a.length; g += 16) {
      f(a, c, 0, g, g + 16);
      for (var h = 0; h < 16; h++) c[h] ^= this._lastCipherblock[h];
      (this._lastCipherblock = this._aes.encrypt(c)),
        f(this._lastCipherblock, b, g);
    }
    return b;
  }),
    (B.prototype.decrypt = function (a) {
      a = d(a);
      if (a.length % 16 !== 0)
        throw new Error(
          "invalid ciphertext size (must be multiple of 16 bytes)"
        );
      var b = e(a.length),
        c = e(16);
      for (var g = 0; g < a.length; g += 16) {
        f(a, c, 0, g, g + 16), (c = this._aes.decrypt(c));
        for (var h = 0; h < 16; h++) b[g + h] = c[h] ^ this._lastCipherblock[h];
        f(a, this._lastCipherblock, 0, g, g + 16);
      }
      return b;
    });
  var C = function (a, b, c) {
    if (!(this instanceof C))
      throw Error("AES must be instanitated with `new`");
    (this.description = "Cipher Feedback"), (this.name = "cfb");
    if (!b) b = e(16);
    else if (b.length != 16)
      throw new Error("invalid initialation vector size (must be 16 size)");
    c || (c = 1),
      (this.segmentSize = c),
      (this._shiftRegister = d(b, !0)),
      (this._aes = new z(a));
  };
  (C.prototype.encrypt = function (a) {
    if (a.length % this.segmentSize != 0)
      throw new Error("invalid plaintext size (must be segmentSize bytes)");
    var b = d(a, !0),
      c;
    for (var e = 0; e < b.length; e += this.segmentSize) {
      c = this._aes.encrypt(this._shiftRegister);
      for (var g = 0; g < this.segmentSize; g++) b[e + g] ^= c[g];
      f(this._shiftRegister, this._shiftRegister, 0, this.segmentSize),
        f(
          b,
          this._shiftRegister,
          16 - this.segmentSize,
          e,
          e + this.segmentSize
        );
    }
    return b;
  }),
    (C.prototype.decrypt = function (a) {
      if (a.length % this.segmentSize != 0)
        throw new Error("invalid ciphertext size (must be segmentSize bytes)");
      var b = d(a, !0),
        c;
      for (var e = 0; e < b.length; e += this.segmentSize) {
        c = this._aes.encrypt(this._shiftRegister);
        for (var g = 0; g < this.segmentSize; g++) b[e + g] ^= c[g];
        f(this._shiftRegister, this._shiftRegister, 0, this.segmentSize),
          f(
            a,
            this._shiftRegister,
            16 - this.segmentSize,
            e,
            e + this.segmentSize
          );
      }
      return b;
    });
  var D = function (a, b) {
    if (!(this instanceof D))
      throw Error("AES must be instanitated with `new`");
    (this.description = "Output Feedback"), (this.name = "ofb");
    if (!b) b = e(16);
    else if (b.length != 16)
      throw new Error("invalid initialation vector size (must be 16 bytes)");
    (this._lastPrecipher = d(b, !0)),
      (this._lastPrecipherIndex = 16),
      (this._aes = new z(a));
  };
  (D.prototype.encrypt = function (a) {
    var b = d(a, !0);
    for (var c = 0; c < b.length; c++)
      this._lastPrecipherIndex === 16 &&
        ((this._lastPrecipher = this._aes.encrypt(this._lastPrecipher)),
        (this._lastPrecipherIndex = 0)),
        (b[c] ^= this._lastPrecipher[this._lastPrecipherIndex++]);
    return b;
  }),
    (D.prototype.decrypt = D.prototype.encrypt);
  var E = function (a) {
    if (!(this instanceof E))
      throw Error("Counter must be instanitated with `new`");
    a !== 0 && !a && (a = 1),
      typeof a == "number"
        ? ((this._counter = e(16)), this.setValue(a))
        : this.setBytes(a);
  };
  (E.prototype.setValue = function (a) {
    if (typeof a != "number" || parseInt(a) != a)
      throw new Error("invalid counter value (must be an integer)");
    for (var b = 15; b >= 0; --b) (this._counter[b] = a % 256), (a = a >> 8);
  }),
    (E.prototype.setBytes = function (a) {
      a = d(a, !0);
      if (a.length != 16)
        throw new Error("invalid counter bytes size (must be 16 bytes)");
      this._counter = a;
    }),
    (E.prototype.increment = function () {
      for (var a = 15; a >= 0; a--)
        if (this._counter[a] === 255) this._counter[a] = 0;
        else {
          this._counter[a]++;
          break;
        }
    });
  var F = function (a, b) {
    if (!(this instanceof F))
      throw Error("AES must be instanitated with `new`");
    (this.description = "Counter"),
      (this.name = "ctr"),
      b instanceof E || (b = new E(b)),
      (this._counter = b),
      (this._remainingCounter = null),
      (this._remainingCounterIndex = 16),
      (this._aes = new z(a));
  };
  (F.prototype.encrypt = function (a) {
    var b = d(a, !0);
    for (var c = 0; c < b.length; c++)
      this._remainingCounterIndex === 16 &&
        ((this._remainingCounter = this._aes.encrypt(this._counter._counter)),
        (this._remainingCounterIndex = 0),
        this._counter.increment()),
        (b[c] ^= this._remainingCounter[this._remainingCounterIndex++]);
    return b;
  }),
    (F.prototype.decrypt = F.prototype.encrypt);
  var I = {
    AES: z,
    Counter: E,
    ModeOfOperation: {
      ecb: A,
      cbc: B,
      cfb: C,
      ofb: D,
      ctr: F,
    },
    utils: {
      hex: h,
      utf8: g,
    },
    padding: {
      pkcs7: {
        pad: G,
        strip: H,
      },
    },
    _arrayTest: {
      coerceArray: d,
      createArray: e,
      copyArray: f,
    },
  };
  return {
    aesjs: I,
  };
})(this);
