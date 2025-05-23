import { render, screen, waitFor } from "@testing-library/react";
import { BrandingProvider, useBrandingContext } from "../../../app/components/providers/BrandingProvider";

describe("BrandingProvider", () => {
  const renderElement = (children: JSX.Element) => {
    return render(<BrandingProvider>{children}</BrandingProvider>);
  };

  it("should throw error if useBrandingContext is used outside of BrandingProvider", () => {
    const ShouldErrorComponent = () => {
      useBrandingContext();
      return <div>test</div>;
    };
    expect(() => render(<ShouldErrorComponent />))
      .toThrowError("useBrandingContext must be used within a BrandingProvider");
  });

  it("provides logo branding information and brand name", async () => {
    const TestComponent = () => {
      const { logoConfig, brandName } = useBrandingContext();

      return (
        <>
          <span data-testid="logo-config-alt-text">{logoConfig?.altText}</span>;
          <span data-testid="logo-config-filename">{logoConfig?.filename}</span>;
          <span data-testid="logo-config-link">{logoConfig?.linkDestination}</span>;
          <span data-testid="brand-name">{brandName}</span>;
        </>
      );
    };

    renderElement(<TestComponent />);

    expect(screen.getByTestId("brand-name")).toHaveTextContent("App Title");

    await waitFor(() => {
      expect(screen.getByTestId("logo-config-alt-text")).toHaveTextContent("This logo has alt text");
      expect(screen.getByTestId("logo-config-filename")).toHaveTextContent("logo-for-website.png");
      expect(screen.getByTestId("logo-config-link")).toHaveTextContent("https://example.com");
    });
  });
});
