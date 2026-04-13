import { render, screen, waitFor } from "@testing-library/react";
import { RunnerConfigProvider, useRunnerConfig } from "@components/providers/RunnerConfigProvider";
import { StorageKeys } from "@lib/types/StorageKeys";
import { useGetRunnerEnabled } from "@components/header/hooks/useGetRunnerEnabled";

vitest.mock("@components/header/hooks/useGetRunnerEnabled", () => ({
  useGetRunnerEnabled: vitest.fn()
}));

const mockedUseGetRunnerEnabled = vitest.mocked(useGetRunnerEnabled);

describe("RunnerConfigProvider", () => {
  const TestComponent = () => {
    const isRunnerEnabled = useRunnerConfig();
    return <div data-testid="runner-enabled">{`${isRunnerEnabled}`}</div>;
  };

  afterEach(() => {
    sessionStorage.removeItem(StorageKeys.RUNNER_CONFIG);
    mockedUseGetRunnerEnabled.mockReset();
  });

  it("reads enabled runner config from sessionStorage", () => {
    sessionStorage.setItem(StorageKeys.RUNNER_CONFIG, JSON.stringify(true));
    mockedUseGetRunnerEnabled.mockReturnValue({
      isRunnerEnabled: undefined,
      isLoading: false,
      error: undefined
    });

    render(
      <RunnerConfigProvider>
        <TestComponent />
      </RunnerConfigProvider>
    );

    expect(mockedUseGetRunnerEnabled).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("runner-enabled")).toHaveTextContent("true");
  });

  it("reads disabled runner config from sessionStorage", () => {
    sessionStorage.setItem(StorageKeys.RUNNER_CONFIG, JSON.stringify(false));
    mockedUseGetRunnerEnabled.mockReturnValue({
      isRunnerEnabled: undefined,
      isLoading: false,
      error: undefined
    });

    render(
      <RunnerConfigProvider>
        <TestComponent />
      </RunnerConfigProvider>
    );

    expect(mockedUseGetRunnerEnabled).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("runner-enabled")).toHaveTextContent("false");
  });

  it("writes enabled runner config to sessionStorage when fetched", async () => {
    mockedUseGetRunnerEnabled.mockReturnValue({
      isRunnerEnabled: true,
      isLoading: false,
      error: undefined
    });

    render(
      <RunnerConfigProvider>
        <TestComponent />
      </RunnerConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("runner-enabled")).toHaveTextContent("true");
      expect(sessionStorage.getItem(StorageKeys.RUNNER_CONFIG)).toBe("true");
    });
  });

  it("writes disabled runner config to sessionStorage when fetched", async () => {
    mockedUseGetRunnerEnabled.mockReturnValue({
      isRunnerEnabled: false,
      isLoading: false,
      error: undefined
    });

    render(
      <RunnerConfigProvider>
        <TestComponent />
      </RunnerConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("runner-enabled")).toHaveTextContent("false");
      expect(sessionStorage.getItem(StorageKeys.RUNNER_CONFIG)).toBe("false");
    });
  });
});
