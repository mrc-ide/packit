import active from "../config/active.json";
import { Header } from "./components/header";
import { Main } from "./components/main";

export const App = () => {
  return (
    <div data-testid="app" className={active.instance}>
      <Header />
      <div className="app">
        <Main />
      </div>
    </div>
  );
};
