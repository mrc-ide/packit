import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumb } from "@components/main/Breadcrumb";

const renderBreadcrumb = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Breadcrumb />
    </MemoryRouter>
  );

describe("Breadcrumb test", () => {
  it("should append Home to start of pathnames", () => {
    renderBreadcrumb("/hello");

    const homeLink = screen.getByText(/home/i);

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should render 3 layers of paths correctly", () => {
    renderBreadcrumb("/hello/world/there");

    const homeLink = screen.getByText(/home/i);
    const helloLink = screen.getByText(/hello/i);
    const worldLink = screen.getByText(/world/i);
    const thereLink = screen.getByText(/there/i);

    expect(homeLink).toHaveAttribute("href", "/");
    expect(helloLink).toHaveAttribute("href", "/hello");
    expect(worldLink).toHaveAttribute("href", "/hello/world");
    expect(thereLink).toBeVisible();
  });
  it("shoul not render link for last element", () => {
    renderBreadcrumb("/hello/world/there");

    const thereLink = screen.getByText(/there/i);

    expect(thereLink).not.toHaveAttribute("href");
  });
});
