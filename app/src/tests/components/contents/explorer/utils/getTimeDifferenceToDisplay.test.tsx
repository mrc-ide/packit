// FILEPATH: /home/athapar/code/packit/app/src/app/components/contents/explorer/utils/getTimeDifferenceToDisplay.test.ts

import { getTimeDifferenceToDisplay } 
from "../../../../../app/components/contents/explorer/utils/getTimeDifferenceToDisplay";

describe("getTimeDifferenceToDisplay", () => {
  const currentTime = Math.floor(Date.now() / 1000);

  test("returns difference in days", () => {
    const unixTime = currentTime - 3 * 24 * 60 * 60; // 3 days ago
    expect(getTimeDifferenceToDisplay(unixTime)).toEqual({ unit: "days", value: 3 });
  });

  test("returns difference in hours", () => {
    const unixTime = currentTime - 5 * 60 * 60; // 5 hours ago
    expect(getTimeDifferenceToDisplay(unixTime)).toEqual({ unit: "hours", value: 5 });
  });

  test("returns difference in minutes", () => {
    const unixTime = currentTime - 45 * 60; // 45 minutes ago
    expect(getTimeDifferenceToDisplay(unixTime)).toEqual({ unit: "minutes", value: 45 });
  });

  test("returns difference in seconds", () => {
    const unixTime = currentTime - 30; // 30 seconds ago
    expect(getTimeDifferenceToDisplay(unixTime)).toEqual({ unit: "seconds", value: 30 });
  });
});
