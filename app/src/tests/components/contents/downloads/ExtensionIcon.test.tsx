import { render } from "@testing-library/react";
import { ExtensionIcon } from "../../../../app/components/contents/downloads/ExtensionIcon";

describe("extension icon component", () => {
  it("renders the appropriate icon depending on the extension, case-insenstively", async () => {
    const { container } = render(<ExtensionIcon path={"my_strange_file.PDF"}></ExtensionIcon>);

    const icon = container.querySelector(".lucide") as HTMLImageElement;
    expect(icon.classList).toContain("lucide-presentation");
  });
});
