import { render, screen } from "@testing-library/react";
import AppWithoutRelay from "./AppWithoutRelay";

test("renders learn react link", () => {
    render(<AppWithoutRelay />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
