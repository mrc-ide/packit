import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PacketFile } from "../../../../app/components/contents/packets";
import appConfig from "../../../../config/appConfig";

describe("Packet file component", () => {
  it("renders iframe with the correct src", () => {
    const fileMetadata = { hash: "example-hash", path: "example.html", size: 1 };

    const { container } = render(
      <MemoryRouter>
        <PacketFile path={"example.html"} />
      </MemoryRouter>
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", `${appConfig.apiUrl()}/example.html`);
  });
});
