import { render, screen } from "@testing-library/react";
import useSWR from "swr";
import appConfig from "@config/appConfig";
import { useGetRunnerEnabled } from "@components/header/hooks/useGetRunnerEnabled";

vitest.mock("swr", () => ({
  default: vitest.fn()
}));

const mockedUseSWR = vitest.mocked(useSWR);

const TestComponent = ({ runnerEnabled }: { runnerEnabled: boolean | null }) => {
  const { isRunnerEnabled } = useGetRunnerEnabled(runnerEnabled);

  return (
    <>
      <div data-testid="is-runner-enabled">{`${isRunnerEnabled}`}</div>
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
    mockedUseSWR.mockReturnValue({
      data: false,
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof useSWR<boolean>>);

    render(<TestComponent runnerEnabled={false} />);

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { revalidateOnFocus: false });
    expect(screen.getByTestId("is-runner-enabled")).toHaveTextContent("false");
  });
});
