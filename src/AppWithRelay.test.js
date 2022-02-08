import { render, screen } from "@testing-library/react";
import AppWithRelay from "./AppWithRelay";

test("renders learn react link", () => {
    render(<AppWithRelay />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
