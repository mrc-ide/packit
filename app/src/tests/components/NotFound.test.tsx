import React from "react";
import {render} from "@testing-library/react";
import {NotFound} from "../../app/components/NotFound";

describe("NotFound component", () => {

    it('renders the page not found message', () => {
        const { getByText } = render(<NotFound />);
        const pageTitle = getByText('PAGE NOT FOUND');
        const errorMessage = getByText('The requested page was not found, check the URL and try again or go to our');
        const homepageLink = getByText('homepage');

        expect(homepageLink).toHaveAttribute('href', '/');

        expect(pageTitle).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
        expect(homepageLink).toBeInTheDocument();
    });
})
