import { render, screen } from "@testing-library/react";
import useSWR from "swr";
import appConfig from "@config/appConfig";
import { useGetRunnerEnabled } from "@components/header/hooks/useGetRunnerEnabled";

vitest.mock("swr", () => ({
  default: vitest.fn()
}));

const mockedUseSWR = vitest.mocked(useSWR);

const TestComponent = ({ runnerEnabled }: { runnerEnabled: boolean | null }) => {
  const { isRunnerEnabled, isLoading, error } = useGetRunnerEnabled(runnerEnabled);

  return (
    <>
      <div data-testid="is-runner-enabled">{`${isRunnerEnabled}`}</div>
      <div data-testid="is-loading">{`${isLoading}`}</div>
      <div data-testid="has-error">{`${Boolean(error)}`}</div>
    </>
  );
};

describe("useGetRunnerEnabled", () => {
  afterEach(() => {
    mockedUseSWR.mockReset();
  });

  it("fetches runner enabled config when runnerEnabled is null", () => {
    mockedUseSWR.mockReturnValue({
      data: true,
      error: undefined,
      isLoading: false
    } as ReturnType<typeof useSWR<boolean>>);

    render(<TestComponent runnerEnabled={null} />);

    expect(mockedUseSWR).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/runner/enabled`,
      expect.any(Function),
      { revalidateOnFocus: false }
    );
    expect(screen.getByTestId("is-runner-enabled")).toHaveTextContent("true");
    expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("has-error")).toHaveTextContent("false");
  });

  it("does not fetch runner enabled config when runnerEnabled is true", () => {
    mockedUseSWR.mockReturnValue({
      data: true,
      error: undefined,
      isLoading: false
    } as ReturnType<typeof useSWR<boolean>>);

    render(<TestComponent runnerEnabled={true} />);

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { revalidateOnFocus: false });
    expect(screen.getByTestId("is-runner-enabled")).toHaveTextContent("true");
  });

  it("does not fetch runner enabled config when runnerEnabled is false", () => {
    const error = new Error("test");
    mockedUseSWR.mockReturnValue({
      data: false,
      error,
      isLoading: true
    } as ReturnType<typeof useSWR<boolean>>);

    render(<TestComponent runnerEnabled={false} />);

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { revalidateOnFocus: false });
    expect(screen.getByTestId("is-runner-enabled")).toHaveTextContent("false");
    expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
    expect(screen.getByTestId("has-error")).toHaveTextContent("true");
  });
});
