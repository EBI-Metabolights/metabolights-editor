import { shouldSkipDefaultControlListsForPath } from "./default-control-lists-route.util";

describe("shouldSkipDefaultControlListsForPath", () => {
  it("skips the configuration call for the data policy page", () => {
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/datapolicy")).toBeTrue();
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/datapolicy/")).toBeTrue();
  });

  it("skips the configuration call for guides pages", () => {
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/guides")).toBeTrue();
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/guides/Quick_start_Guide")).toBeTrue();
  });

  it("does not skip the configuration call for non-static routes", () => {
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/guide/create")).toBeFalse();
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/console")).toBeFalse();
    expect(shouldSkipDefaultControlListsForPath("/metabolights/editor/MTBLS1")).toBeFalse();
  });
});
