import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../app/components/header/Header";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";

describe("header component", () => {
  const renderElement = () => {
    return render(
      <ThemeProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </ThemeProvider>
    );
  };
  // TODO add tests
  it("can render header", () => {
    renderElement();
  });
});
