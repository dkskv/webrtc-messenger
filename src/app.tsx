import { MainPage } from "./pages/main-page";
import { SnackbarProvider } from "./shared/ui/snackbar/snackbar-provider";

export function App() {
  return (
    <SnackbarProvider>
      <MainPage />
    </SnackbarProvider>
  );
}
