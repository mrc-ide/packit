import { render } from "@testing-library/react";
import { StatusIcon } from "../../../../../app/components/contents/runner/logs/StatusIcon";

describe("StatusIcon component", () => {
  it("should render pending icon with extra classnames when status is PENDING", () => {
    render(<StatusIcon status="PENDING" iconClassName="iconClassName" iconWrapperClassName="iconWrapperClassName" />);

    const icon = document.querySelector("svg") as SVGElement;

    expect(icon).toHaveClass("iconClassName lucide-circle-ellipsis");
  });

  it("should render running icon with extra classnames when status is RUNNING", () => {
    render(<StatusIcon status="RUNNING" iconClassName="iconClassName" iconWrapperClassName="iconWrapperClassName" />);

    const icon = document.querySelector("svg") as SVGElement;

    expect(icon).toHaveClass("iconClassName lucide-loader-circle");
    expect(icon.parentElement).toHaveClass("iconWrapperClassName");
  });

  it("should render complete icon with extra classnames when status is COMPLETE", () => {
    render(<StatusIcon status="COMPLETE" iconClassName="iconClassName" iconWrapperClassName="iconWrapperClassName" />);

    const icon = document.querySelector("svg") as SVGElement;

    expect(icon).toHaveClass("iconClassName lucide-circle-check");
  });

  it("should render error icon with extra classnames when status is ERROR", () => {
    render(<StatusIcon status="ERROR" iconClassName="iconClassName" iconWrapperClassName="iconWrapperClassName" />);

    const icon = document.querySelector("svg") as SVGElement;

    expect(icon).toHaveClass("iconClassName lucide-circle-x");
  });
});
