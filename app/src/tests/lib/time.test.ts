import { getTimeDifferenceToDisplay } from "@lib/time";

describe("getTimeDifferenceToDisplay", () => {
  it("should return correct difference in days, hours, minutes, and seconds", () => {
    const startTime = 0;
    const endTime = 90061; // 1 day, 1 hour, 1 minute, and 1 second
    const result = getTimeDifferenceToDisplay(startTime, endTime);
    expect(result).toEqual([
      { unit: "days", value: 1 },
      { unit: "hours", value: 1 },
      { unit: "minutes", value: 1 },
      { unit: "seconds", value: 1 }
    ]);
  });

  it("should return empty array when end time is the same as start time", () => {
    const startTime = 1000;
    const endTime = 1000;
    const result = getTimeDifferenceToDisplay(startTime, endTime);
    expect(result).toEqual([]);
  });

  it("should return empty array when end time is before start time", () => {
    const startTime = 1000;
    const endTime = 500;
    const result = getTimeDifferenceToDisplay(startTime, endTime);
    expect(result).toEqual([]);
  });

  it("should use current time as default end time", () => {
    const startTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const result = getTimeDifferenceToDisplay(startTime);
    expect(result).toEqual([
      { unit: "hours", value: 1 },
      { unit: "seconds", value: 1 }
    ]);
  });

  it("should only return units with values greater than 0", () => {
    const startTime = 0;
    const endTime = 61; // 1 minute and 1 second
    const result = getTimeDifferenceToDisplay(startTime, endTime);
    expect(result).toEqual([
      { unit: "minutes", value: 1 },
      { unit: "seconds", value: 1 }
    ]);
  });
});
