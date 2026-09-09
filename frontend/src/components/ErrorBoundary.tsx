import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la interfaz", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="admin-state" role="alert" style={{ padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Algo salió mal en esta pantalla</h1>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Tu trabajo guardado está a salvo. Recarga la página para continuar; si el problema
          se repite, abre otra sección desde el menú.
        </p>
        <button type="button" className="primary-button" onClick={() => window.location.reload()}>
          Recargar Avendia
        </button>
      </main>
    );
  }
}
