import { render, screen, waitFor } from "@testing-library/react";
import { BrandingProvider, useBrandingContext } from "../../../app/components/providers/BrandingProvider";

describe("BrandingProvider", () => {
  const renderElement = (children: JSX.Element) => {
    return render(<BrandingProvider>{children}</BrandingProvider>);
  };

  it("should throw error if useBrandingContext is used outside of BrandingProvider", () => {
    const TestComponent = () => {
      useBrandingContext();
      return <div>test</div>;
    };
    expect(() => render(<TestComponent />)).toThrowError("useBrandingContext must be used within a BrandingProvider");
  });

  it("provides logo branding information and brand name", async () => {
    const TestComponent = () => {
      const { logoConfig, logoConfigIsLoaded, brandName } = useBrandingContext();

      return (
        <>
          <span data-testid="logo-config-is-loaded">{logoConfigIsLoaded ? "true" : "false"}</span>;
          <span data-testid="logo-config-alt-text">{logoConfig?.altText}</span>;
          <span data-testid="logo-config-filename">{logoConfig?.filename}</span>;
          <span data-testid="logo-config-link">{logoConfig?.linkDestination}</span>;
          <span data-testid="brand-name">{brandName}</span>;
        </>
      );
    };
    renderElement(<TestComponent />);
    expect(screen.getByTestId("logo-config-is-loaded")).toHaveTextContent("false");

    expect(screen.getByTestId("brand-name")).toHaveTextContent("App Title");

    await waitFor(() => {
      expect(screen.getByTestId("logo-config-is-loaded")).toHaveTextContent("true");
      expect(screen.getByTestId("logo-config-alt-text")).toHaveTextContent("This logo has alt text");
      expect(screen.getByTestId("logo-config-filename")).toHaveTextContent("logo-for-website.png");
      expect(screen.getByTestId("logo-config-link")).toHaveTextContent("https://example.com");
    });
  });
});
