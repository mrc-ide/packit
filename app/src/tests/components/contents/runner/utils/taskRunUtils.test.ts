import { RunInfo } from "../../../../../app/components/contents/runner/types/RunInfo";
import {
  getStatusDisplayByStatus,
  getTimeInDisplayFormat
} from "../../../../../app/components/contents/runner/utils/taskRunUtils";
import { TimeDifference } from "../../../../../lib/time";

const mockDisplayTime = jest.fn();
jest.mock("../../../../../lib/time", () => ({
  getTimeDifferenceToDisplay: () => mockDisplayTime()
}));

describe("getStatusDisplayByStatus", () => {
  const mockRunInfo = {
    timeQueued: 1620000000,
    timeStarted: 1620003600,
    timeCompleted: 1620007200
  } as RunInfo;

  it("should return correct display for PENDING status", () => {
    mockDisplayTime.mockReturnValueOnce([{ unit: "minutes", value: 10 }]);

    const result = getStatusDisplayByStatus({ ...mockRunInfo, status: "PENDING" });

    expect(result.borderColor).toBe("border-gray-400 dark:border-gray-700");
    expect(result.separatorColor).toBe("bg-gray-400 dark:bg-gray-700");
    expect(result.displayDuration).toBe("Waiting for  10 m");
    expect(result.createdTime).toEqual(new Date((mockRunInfo.timeQueued as number) * 1000));
    expect(result.bgColor).toBe("bg-gray-50 dark:bg-gray-950");
  });

  it("should return correct display for RUNNING status", () => {
    mockDisplayTime.mockReturnValueOnce([{ unit: "minutes", value: 10 }]);

    const result = getStatusDisplayByStatus({ ...mockRunInfo, status: "RUNNING" });

    expect(result.borderColor).toBe("border-yellow-400 dark:border-yellow-700");
    expect(result.separatorColor).toBe("bg-yellow-400 dark:bg-yellow-700");
    expect(result.displayDuration).toBe("Running for  10 m");
    expect(result.startTime).toEqual(new Date((mockRunInfo.timeStarted as number) * 1000));
    expect(result.bgColor).toBe("bg-yellow-50 dark:bg-yellow-950");
  });

  it("should return correct display for COMPLETE status", () => {
    mockDisplayTime.mockReturnValueOnce([{ unit: "minutes", value: 10 }]);

    const result = getStatusDisplayByStatus({ ...mockRunInfo, status: "COMPLETE" });
    expect(result.borderColor).toBe("border-green-400 dark:border-green-700");
    expect(result.separatorColor).toBe("bg-green-400 dark:bg-green-700");
    expect(result.displayDuration).toBe("Ran in  10 m");
    expect(result.finishTime).toEqual(new Date((mockRunInfo.timeCompleted as number) * 1000));
    expect(result.bgColor).toBe("bg-green-50 dark:bg-green-950");
  });

  it("should return correct display for default case", () => {
    mockDisplayTime.mockReturnValueOnce([{ unit: "minutes", value: 10 }]);

    const result = getStatusDisplayByStatus({ ...mockRunInfo, status: "ERROR" });
    expect(result.borderColor).toBe("border-red-700");
    expect(result.separatorColor).toBe("bg-red-700");
    expect(result.displayDuration).toBe("Failed in  10 m");
    expect(result.bgColor).toBe("bg-red-50 dark:bg-red-950");
  });

  it("should return correct display duration for default case with no timeCompleted", () => {
    mockDisplayTime.mockReturnValueOnce([{ unit: "minutes", value: 10 }]);

    const result = getStatusDisplayByStatus({ ...mockRunInfo, status: "ERROR", timeCompleted: null });
    expect(result.displayDuration).toBe("Failed");
  });
});

describe("getTimeInDisplayFormat", () => {
  it("should return correct format for time difference array", () => {
    const timeDifference = [
      { unit: "days", value: 1 },
      { unit: "hours", value: 1 },
      { unit: "minutes", value: 1 }
    ];
    const result = getTimeInDisplayFormat(timeDifference);
    expect(result).toBe(" 1 d 1 h");
  });

  it("should return correct format for time difference array with less than 2 units", () => {
    const timeDifference = [{ unit: "days", value: 1 }];
    const result = getTimeInDisplayFormat(timeDifference);
    expect(result).toBe(" 1 d");
  });

  it("should return empty string for empty time difference array", () => {
    const timeDifference: TimeDifference[] = [];
    const result = getTimeInDisplayFormat(timeDifference);
    expect(result).toBe("");
  });
});
